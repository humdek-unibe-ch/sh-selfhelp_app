import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

/**
 * Shared LLM result panel.
 *
 * Renders the result returned by `LlmFormController` in one of four display
 * modes: `default` (plain div), `card` (ion-card), `collapse` (expandable
 * header), or `modal` (overlay). Emits retry / regenerate / generateFeedback
 * / close events so the parent form component can call the backend.
 */
@Component({
    selector: 'app-llm-form-result',
    templateUrl: './llm-form-result.component.html',
    styleUrls: ['./llm-form-result.component.scss'],
    standalone: false
})
export class LlmFormResultComponent implements OnChanges {
    @Input() result: string | null = null;
    @Input() meta: Record<string, unknown> | null = null;
    @Input() mode: 'default' | 'card' | 'collapse' | 'modal' = 'card';
    @Input() title: string = 'Result';
    @Input() closable: boolean = true;
    @Input() cssClass: string = '';
    @Input() isGenerating: boolean = false;
    @Input() generatingText: string = 'Generating response...';
    @Input() error: string | null = null;
    @Input() showErrors: boolean = true;
    @Input() retryEnabled: boolean = true;
    @Input() retryLabel: string = 'Retry';
    @Input() regenerateEnabled: boolean = true;
    @Input() regenerateLabel: string = 'Regenerate';
    @Input() manualFeedbackEnabled: boolean = false;
    @Input() feedbackButtonLabel: string = 'Generate Feedback';
    @Input() feedbackButtonColor: string = 'primary';
    @Input() useSmallButtons: boolean = true;
    /** When `mode === 'modal'`, the modal is considered open when a result
     *  or generating state or error is present. This flag also controls
     *  whether the card/div/collapse body is rendered at all. */
    @Input() autoOpen: boolean = true;

    @Output() retry = new EventEmitter<void>();
    @Output() regenerate = new EventEmitter<void>();
    @Output() generateFeedback = new EventEmitter<void>();
    @Output() close = new EventEmitter<void>();

    /** True once the first non-null result or error is shown; drives modal
     *  visibility and collapse expansion. */
    public modalOpen: boolean = false;
    public expanded: boolean = true;
    public closed: boolean = false;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['result'] || changes['error'] || changes['isGenerating']) {
            const hasContent = !!this.result || !!this.error || this.isGenerating;
            if (hasContent) {
                this.closed = false;
                if (this.autoOpen && this.mode === 'modal') {
                    this.modalOpen = true;
                }
            }
        }
        if (changes['mode']) {
            this.modalOpen = this.mode === 'modal' && !!this.result;
        }
    }

    /** True when the panel body should render. */
    public get hasBody(): boolean {
        return !this.closed && (!!this.result || !!this.error || this.isGenerating);
    }

    public get buttonSize(): 'small' | 'default' {
        return this.useSmallButtons ? 'small' : 'default';
    }

    public onRetry(): void {
        this.retry.emit();
    }

    public onRegenerate(): void {
        this.regenerate.emit();
    }

    public onGenerateFeedback(): void {
        this.generateFeedback.emit();
    }

    public onClose(): void {
        this.closed = true;
        this.modalOpen = false;
        this.close.emit();
    }

    public onToggleExpanded(): void {
        this.expanded = !this.expanded;
    }

    public onModalDismiss(): void {
        this.modalOpen = false;
        this.closed = true;
        this.close.emit();
    }
}
