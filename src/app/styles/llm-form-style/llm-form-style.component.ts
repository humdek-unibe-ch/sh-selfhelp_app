import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { LlmFormService } from 'src/app/services/llm-form.service';
import {
    LlmFormStyle,
    LlmFormSubmitResponse
} from 'src/app/selfhelpInterfaces';
import { FormUserInputStyleComponent } from '../form-user-input-style/form-user-input-style.component';

/**
 * Base component shared by `llmFormRecord` and `llmFormLog` mobile styles.
 *
 * Extends the regular `FormUserInputStyleComponent` so all the existing
 * form rendering / validation / submission helpers (`collectFormFields`,
 * `prepareParams`, `formSubmitClick`, `cancelUrl`) are reused as-is.
 *
 * This component adds:
 *  - LLM-enabled submit flow via `LlmFormService.submitLlmForm()`.
 *  - Retry / regenerate / generate_feedback actions wired to the shared
 *    `<app-llm-form-result>` panel.
 *  - Placement layout (top / bottom / left / right) that wraps the form
 *    together with the result panel.
 *  - Optional manual-feedback mode where the LLM is only called when the
 *    user presses the "Generate Feedback" button.
 *  - Pre-filled previous result/meta from the backend when
 *    `llm_show_previous_result === '1'`.
 */
@Component({
    selector: 'app-llm-form-style',
    templateUrl: './llm-form-style.component.html',
    styleUrls: ['./llm-form-style.component.scss'],
    standalone: false
})
export class LlmFormStyleComponent extends FormUserInputStyleComponent implements OnInit {
    @Input() override style!: LlmFormStyle;

    public llmResult: string | null = null;
    public llmMeta: Record<string, unknown> | null = null;
    public llmError: string | null = null;
    public llmIsGenerating: boolean = false;
    /** Record id returned by the backend after a successful save; used for
     *  subsequent regenerate / retry actions. */
    public lastRecordId: string | null = null;
    /** Tracks whether the last submit entered manual-feedback mode, so we
     *  show the "Generate Feedback" button without running the LLM. */
    public manualFeedbackPending: boolean = false;

    constructor(
        formBuilder: FormBuilder,
        selfhelpService: SelfhelpService,
        private llmFormService: LlmFormService
    ) {
        super(formBuilder, selfhelpService);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        if (this.getFieldContent('llm_show_previous_result') === '1') {
            const previous = this.readField('llm_previous_result');
            const previousMeta = this.readField('llm_previous_meta');
            if (typeof previous === 'string' && previous.length > 0) {
                this.llmResult = previous;
            }
            if (previousMeta && typeof previousMeta === 'object') {
                this.llmMeta = previousMeta as Record<string, unknown>;
            }
        }
        // Seed lastRecordId from the backend payload so regenerate / retry
        // work on first load, before the user submits anything in this session.
        const seededRecordId = this.readField('current_record_id');
        if (seededRecordId !== undefined && seededRecordId !== null && seededRecordId !== '') {
            this.lastRecordId = String(seededRecordId);
        }
    }

    /**
     * Override submit flow: when LLM is disabled (`llm_enabled !== '1'`)
     * fall back to the regular form submit; otherwise post with
     * `__llm_form=1` and handle the structured JSON response.
     */
    public override async submitForm(value: { [key: string]: any }): Promise<void> {
        const llmEnabled = this.getFieldContent('llm_enabled');
        if (llmEnabled !== '1') {
            await super.submitForm(value);
            return;
        }

        this.isSubmitting = true;
        this.selfhelpService.formSubmitting.next(true);
        this.llmError = null;
        this.llmIsGenerating = !this.isManualFeedbackEnabled();
        this.manualFeedbackPending = false;
        try {
            const params = this.prepareParams(value);
            const res = await this.llmFormService.submitLlmForm(this.url, params);
            this.applyLlmResponse(res);

            if (res.success && this.getFieldContent('close_modal_at_end') === '1') {
                this.selfhelpService.closeModal('submit');
            }
            if (res.success && this.getFieldContent('redirect_at_end') !== '') {
                this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
            }
        } catch (err) {
            this.llmError = err instanceof Error ? err.message : 'Failed to submit form';
        } finally {
            this.isSubmitting = false;
            this.llmIsGenerating = false;
            if (!this.selfhelpService.selfhelp.getValue().enable_event_listener) {
                this.selfhelpService.formSubmitting.next(false);
            }
        }
    }

    /** Regenerate the LLM result for the last saved record. Works even
     *  if `lastRecordId` is unknown — the backend falls back to the
     *  user's most recent record in that case. */
    public async onRegenerate(): Promise<void> {
        this.llmIsGenerating = true;
        this.llmError = null;
        try {
            const res = await this.llmFormService.regenerateLlm(this.url, this.lastRecordId);
            this.applyLlmResponse(res);
        } catch (err) {
            this.llmError = err instanceof Error ? err.message : 'Regeneration failed';
        } finally {
            this.llmIsGenerating = false;
        }
    }

    /** Retry LLM generation after an earlier failure. */
    public async onRetry(): Promise<void> {
        this.llmIsGenerating = true;
        this.llmError = null;
        try {
            const res = await this.llmFormService.retryLlm(this.url, this.lastRecordId);
            this.applyLlmResponse(res);
        } catch (err) {
            this.llmError = err instanceof Error ? err.message : 'Retry failed';
        } finally {
            this.llmIsGenerating = false;
        }
    }

    /**
     * Generate manual feedback using the current form values. Does not save
     * the form; intended for use with `llm_manual_feedback_enabled`.
     */
    public async onGenerateFeedback(): Promise<void> {
        this.llmIsGenerating = true;
        this.llmError = null;
        this.manualFeedbackPending = false;
        try {
            const params = this.prepareParams(this.form.value);
            const res = await this.llmFormService.generateManualFeedback(this.url, params);
            this.applyLlmResponse(res);
        } catch (err) {
            this.llmError = err instanceof Error ? err.message : 'Feedback generation failed';
        } finally {
            this.llmIsGenerating = false;
        }
    }

    public onClosePanel(): void {
        // No-op; the shared panel already clears its own visibility. Keeping
        // this hook so the template can be explicit about the interaction.
    }

    /**
     * Resolved panel mode for the template, falling back to `card`.
     */
    public get panelMode(): 'default' | 'card' | 'collapse' | 'modal' {
        const raw = this.getFieldContent('llm_result_panel') || 'card';
        const allowed = ['default', 'card', 'collapse', 'modal'];
        return (allowed.includes(raw) ? raw : 'card') as 'default' | 'card' | 'collapse' | 'modal';
    }

    /**
     * Placement for the result panel relative to the form. CSS Flex is used
     * for the layout: `column` for top/bottom, `row` for left/right.
     */
    public get placement(): 'top' | 'bottom' | 'left' | 'right' {
        const raw = this.getFieldContent('llm_result_placement') || 'bottom';
        const allowed = ['top', 'bottom', 'left', 'right'];
        return (allowed.includes(raw) ? raw : 'bottom') as 'top' | 'bottom' | 'left' | 'right';
    }

    public get layoutClass(): string {
        return `llm-form-layout llm-form-layout--${this.placement}`;
    }

    public get resultCssClass(): string {
        const base = this.getFieldContent('llm_result_css') || '';
        const mobile = this.getFieldContent('llm_result_css_mobile') || '';
        return [base, mobile].filter(s => !!s).join(' ').trim();
    }

    public isManualFeedbackEnabled(): boolean {
        return this.getFieldContent('llm_manual_feedback_enabled') === '1';
    }

    /**
     * Whether the "Generate Feedback" button should be visible. Shown
     * whenever manual feedback mode is configured and no result is being
     * generated.
     */
    public get showFeedbackButton(): boolean {
        return this.isManualFeedbackEnabled() && !this.llmIsGenerating;
    }

    /**
     * Apply a backend response to component state (result, meta, errors,
     * manual-feedback flag, last record id).
     */
    private applyLlmResponse(res: LlmFormSubmitResponse): void {
        if (!res) {
            this.llmError = 'Empty response from server';
            return;
        }
        if (res.manual_feedback_mode) {
            // Form saved; user must explicitly press "Generate Feedback"
            // to run the LLM. Mirror the React plugin behaviour: keep the
            // previous result on screen when `llm_show_previous_result` is
            // enabled, otherwise clear it.
            this.manualFeedbackPending = true;
            this.llmError = null;
            const showPrevious = this.getFieldContent('llm_show_previous_result') === '1';
            if (!showPrevious) {
                this.llmResult = null;
                this.llmMeta = null;
            }
            this.rememberRecordIdFromMeta(res.llm_meta);
            return;
        }
        if (!res.success) {
            this.llmError = res.error || this.formatFormErrors(res.form_errors) || 'Request failed';
            return;
        }
        this.llmResult = res.llm_result ?? null;
        this.llmMeta = (res.llm_meta as Record<string, unknown>) || null;
        this.llmError = null;
        this.rememberRecordIdFromMeta(res.llm_meta);
    }

    private rememberRecordIdFromMeta(meta: Record<string, unknown> | undefined): void {
        if (!meta) { return; }
        const candidate = meta['record_id'] ?? meta['recordId'] ?? meta['id'];
        if (candidate !== undefined && candidate !== null) {
            this.lastRecordId = String(candidate);
        }
    }

    private formatFormErrors(errors: string[] | Record<string, string> | undefined): string | null {
        if (!errors) { return null; }
        if (Array.isArray(errors)) {
            return errors.join(', ');
        }
        return Object.values(errors).join(', ');
    }

    /** Read an arbitrary `StyleField`-like attribute off the style object. */
    private readField(key: string): unknown {
        const field = (this.style as any)?.[key];
        if (field && typeof field === 'object' && 'content' in field) {
            return field.content;
        }
        return field;
    }
}
