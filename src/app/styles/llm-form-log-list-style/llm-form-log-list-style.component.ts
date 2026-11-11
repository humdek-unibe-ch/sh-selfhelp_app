import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { LlmFormLogListStyle, LlmInterviewField, LlmInterviewState } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

interface InterviewError {
    type: string,
    message: string,
    state?: LlmInterviewState | null,
    fieldErrors?: { [name: string]: string } | null,
}

interface InterviewStep {
    name: string,
    def: LlmInterviewField,
    status: string,
    number: number | null,
    required: boolean,
    edited: boolean,
    hosted: boolean,
}

/**
 * Mobile side of sh-shp-llm llmFormLogList: the core list, New / Edit open the coach
 * chat (doc/llm-form-interview.md, HTTP contract). Only `approve` saves.
 */
@Component({
    selector: 'app-llm-form-log-list-style',
    templateUrl: './llm-form-log-list-style.component.html',
    styleUrls: ['./llm-form-log-list-style.component.scss'],
    standalone: false
})
export class LlmFormLogListStyleComponent extends BasicStyleComponent implements OnDestroy {
    @Input() override style!: LlmFormLogListStyle;
    @ViewChild('ivContent') ivContent?: IonContent;
    private modalEl: HTMLIonModalElement | null = null;
    isOpen = false;
    state: LlmInterviewState | null = null;
    recordId: number | null = null;
    busy = false;
    pendingText: string | null = null;
    notice: { message: string, danger: boolean } | null = null;
    text = '';
    // Field edits the server has not confirmed yet
    edits: { [name: string]: any } = {};
    fieldErrors: { [name: string]: string } | null = null;
    private syncTimer: any = null;

    // Dismissed directly: after a page refresh Ionic parks this page without change detection
    ngOnDestroy() {
        clearTimeout(this.syncTimer);
        this.modalEl?.dismiss();
    }

    onModalPresent(event: Event) {
        this.modalEl = event.target as HTMLIonModalElement;
    }

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

    get transcriptionParams(): Record<string, string> {
        return {
            '__llm_interview_action': 'transcribe',
            'section_id': String(this.style.interview.sectionId),
            'csrf_token': this.style.interview.csrfToken,
        };
    }

    label(key: string, fallback = ''): string {
        const ui = this.style.interview.labels.ui || {};
        return ui[key] || fallback;
    }

    // The list may emit during its own init; defer one tick
    onOpenRecord(recordId: number | null) {
        setTimeout(() => this.openInterview(recordId));
    }

    async openInterview(recordId: number | null) {
        this.recordId = recordId;
        this.state = null;
        this.notice = null;
        this.text = '';
        this.edits = {};
        this.fieldErrors = null;
        this.isOpen = true;
        await this.run(async () => {
            const body = await this.call('open', { open_token: this.token('open') });
            this.state = body.state;
            if (this.state!.needs_start) {
                await this.turn('', true);
            }
        });
    }

    closeInterview() {
        clearTimeout(this.syncTimer);
        this.isOpen = false;
        this.state = null;
        this.modalEl?.dismiss();
    }

    async send(message?: string) {
        const text = (message !== undefined ? message : this.text).trim();
        if (!text || this.busy || !this.state) {
            return;
        }
        this.text = '';
        await this.run(() => this.turn(text, false));
    }

    async startOver() {
        if (!this.state || this.busy) {
            return;
        }
        this.selfhelpService.presentAlertConfirm({
            msg: this.label('restartConfirm', 'Start over with a fresh draft?'),
            confirmLabel: this.label('restart', 'Start over'),
            cancelLabel: this.label('back', 'Back'),
            callback: () => this.run(async () => {
                const body = await this.call('reset', {
                    open_token: this.token('open'),
                    conversation_id: String(this.state!.conversation_id),
                });
                this.state = body.state;
                if (this.state!.needs_start) {
                    await this.turn('', true);
                }
            })
        });
    }

    approveClick() {
        const st = this.state;
        if (!st || !st.can_approve || this.busy) {
            return;
        }
        const confirm = this.style.interview.confirm;
        if (confirm.mode === 'never' || (confirm.mode === 'edit' && st.mode !== 'edit')) {
            this.approve();
            return;
        }
        const names = st.mode === 'edit' ? st.changed : Object.keys(st.progress.fields);
        const lines = names.map(name => this.fieldLabel(name) + ': ' + (this.valueText(name) || this.label('valueEmpty', 'empty')));
        const intro = confirm.message || (st.mode === 'edit'
            ? this.label('reviewChanges', 'These changes will be saved')
            : this.label('reviewValues', 'These values will be saved'));
        this.selfhelpService.presentAlertConfirm({
            header: confirm.title || (st.mode === 'edit'
                ? this.label('reviewTitleEdit', 'Save your changes?')
                : this.label('reviewTitleNew', 'Save this entry?')),
            msg: intro + ' - ' + lines.join('; '),
            confirmLabel: confirm.continue || this.style.interview.labels.approve,
            cancelLabel: confirm.cancel || this.label('back', 'Back'),
            callback: () => this.approve()
        });
    }

    async approve() {
        await this.run(async () => {
            const st = this.state!;
            const body = await this.call('approve', {
                conversation_id: String(st.conversation_id),
                revision: String(st.revision),
                request_token: this.token('approve'),
                ...this.pendingPatches(),
            });
            this.closeInterview();
            this.selfhelpService.presentToast(this.label('savedText', 'Your answers were saved.'), 'success');
            const redirect = body.approval && body.approval.redirect;
            if (redirect && redirect.startsWith('/')) {
                this.selfhelpService.openUrl(redirect.replace(this.selfhelpService.getBasePath(), ''));
            } else {
                await this.selfhelpService.getPage(this.url);
            }
        });
    }

    getMessages(): { role: string, content: string }[] {
        const out: { role: string, content: string }[] = [];
        for (const m of this.state ? this.state.messages : []) {
            if (m.role !== 'user' && m.role !== 'assistant') {
                continue;
            }
            const prev = out[out.length - 1];
            // A retried turn stores the user message again; show it once.
            if (prev && prev.role === 'user' && m.role === 'user' && prev.content === m.content) {
                continue;
            }
            out.push({ role: m.role, content: m.content });
        }
        return out;
    }

    getQuickReplies(): string[] {
        const st = this.state;
        if (!st || st.blocked || this.busy) {
            return [];
        }
        const suggested = (st.suggestions || []).filter(s => s.trim() !== '');
        if (suggested.length > 0) {
            return suggested;
        }
        // Else the closed options of the question asked
        const def = st.fields[st.asking || st.progress.active || ''];
        if (!def || !def.llm_writable || !def.options || (def.input_type !== 'select' && def.input_type !== 'radio')) {
            return [];
        }
        const rows = def.options.filter(o => o.label !== '');
        return rows.length <= 8 ? rows.map(o => o.label) : [];
    }

    // Numbered when the field counts for progress
    getSteps(): InterviewStep[] {
        const st = this.state;
        if (!st) {
            return [];
        }
        let counter = 0;
        return Object.keys(st.fields).map(name => {
            const pf = st.progress.fields[name];
            return {
                name,
                def: st.fields[name],
                status: pf ? pf.status : 'none',
                number: pf ? ++counter : null,
                required: pf ? pf.required : !!st.fields[name].required,
                edited: this.isChanged(name),
                hosted: this.isHosted(name),
            };
        });
    }

    getStateKey(): 'draft' | 'ready' | 'saved' {
        if (this.state && this.state.mode === 'edit') {
            return 'saved';
        }
        return this.state && this.state.can_approve ? 'ready' : 'draft';
    }

    isAsking(name: string): boolean {
        return !!this.state && (this.state.asking || this.state.progress.active) === name;
    }

    isChanged(name: string): boolean {
        return !!this.state && this.state.mode === 'edit' && this.state.changed.includes(name);
    }

    isHosted(name: string): boolean {
        const def = this.state ? this.state.fields[name] : null;
        return !!def && (def.native_only || (this.style.interview.allowManualEdit && def.manual_writable));
    }

    controlKind(def: LlmInterviewField): string {
        if (def.input_type === 'file') {
            return 'file';
        }
        if (def.input_type === 'checkbox' || def.style === 'checkbox') {
            return 'checkbox';
        }
        if (['textarea', 'select', 'select-multiple', 'radio', 'slider'].includes(def.input_type)) {
            return def.input_type;
        }
        return 'input';
    }

    fieldValue(name: string): any {
        if (name in this.edits) {
            return this.edits[name];
        }
        const value = this.state ? this.state.draft[name] : undefined;
        return value === null || value === undefined ? '' : value;
    }

    checkedValue(def: LlmInterviewField): string {
        return def.constraints && def.constraints.checked_value ? def.constraints.checked_value : '1';
    }

    onFieldChange(name: string, value: any) {
        const def = this.state ? this.state.fields[name] : null;
        if (!def) {
            return;
        }
        this.edits = { ...this.edits, [name]: value };
        // Sync after a short pause, like web's debounced patch
        clearTimeout(this.syncTimer);
        this.syncTimer = setTimeout(() => this.syncEdits(), 700);
    }

    isChecked(name: string, def: LlmInterviewField): boolean {
        return String(this.fieldValue(name)) === this.checkedValue(def);
    }

    fieldLabel(name: string): string {
        const st = this.state;
        if (st && st.progress.fields[name]) {
            return st.progress.fields[name].label;
        }
        return st && st.fields[name] && st.fields[name].label ? st.fields[name].label : name;
    }

    valueText(name: string, source: 'draft' | 'baseline' = 'draft'): string {
        const st = this.state;
        if (!st) {
            return '';
        }
        const raw = source === 'draft' ? st.draft[name] : st.baseline[name];
        const def = st.fields[name];
        const one = (v: any) => {
            const text = v === null || v === undefined ? '' : String(v);
            const hit = def && def.options ? def.options.find(o => String(o.value) === text) : null;
            return hit ? hit.label : text;
        };
        return Array.isArray(raw) ? raw.map(one).join(', ') : one(raw);
    }

    bubbleStyle(role: string): { [key: string]: string } {
        const side = this.style.interview.appearance[role === 'user' ? 'user' : 'ai'] || {};
        return {
            'background-color': side.bg || '',
            'color': side.text || '',
            'border-color': side.border || '',
        };
    }

    avatarStyle(side: 'user' | 'ai'): { [key: string]: string } {
        const look = this.style.interview.appearance[side] || {};
        return { 'background-color': look.bg || '', 'color': look.text || '' };
    }

    avatarImage(side: 'user' | 'ai'): string {
        const look = this.style.interview.appearance[side] || {};
        return look.iconImage ? this.selfhelpService.resolveMediaUrl(look.iconImage) : '';
    }

    avatarIcon(side: 'user' | 'ai'): string {
        const look = this.style.interview.appearance[side] || {};
        return look.iconMobile || (side === 'user' ? 'person-circle' : 'chatbubble-ellipses');
    }

    private async turn(message: string, start: boolean) {
        const requestId = this.token('req');
        this.pendingText = start ? null : message;
        try {
            for (let attempt = 0; ; attempt++) {
                const st = this.state!;
                const before = st.messages.filter(m => m.role === 'user').length;
                try {
                    const extra: { [key: string]: string } = {
                        conversation_id: String(st.conversation_id),
                        revision: String(st.revision),
                        message: message,
                        request_id: requestId,
                        ...this.pendingPatches(),
                    };
                    if (start) {
                        extra['start'] = '1';
                    }
                    const sent = { ...this.edits };
                    const body = await this.call('turn', extra);
                    this.state = body.state;
                    this.ackEdits(sent);
                    return;
                } catch (e: any) {
                    // The draft moved on elsewhere: take the fresh state and send once more.
                    if (attempt === 0 && e && e.type === 'conflict') {
                        this.state = e.state || (await this.call('state', { conversation_id: String(st.conversation_id) }, 'GET')).state;
                        if (this.state!.messages.filter(m => m.role === 'user').length > before) {
                            return;
                        }
                        continue;
                    }
                    throw e;
                }
            }
        } finally {
            this.pendingText = null;
        }
    }

    // native_only fields go in native_patch, the others in patch
    private pendingPatches(): { patch: string, native_patch: string } {
        const patch: { [name: string]: any } = {};
        const native: { [name: string]: any } = {};
        for (const name of Object.keys(this.edits)) {
            const def = this.state ? this.state.fields[name] : null;
            if (def && def.native_only) {
                native[name] = this.edits[name];
            } else if (def) {
                patch[name] = this.edits[name];
            }
        }
        return { patch: JSON.stringify(patch), native_patch: JSON.stringify(native) };
    }

    // Keep an edit that changed again while it was being sent
    private ackEdits(sent: { [name: string]: any }) {
        const left = { ...this.edits };
        for (const name of Object.keys(sent)) {
            if (left[name] === sent[name]) {
                delete left[name];
            }
        }
        this.edits = left;
        this.fieldErrors = null;
    }

    private async syncEdits(attempt = 0) {
        if (!this.state || this.busy || Object.keys(this.edits).length === 0) {
            return;
        }
        const sent = { ...this.edits };
        try {
            const body = await this.call('update_draft', {
                conversation_id: String(this.state.conversation_id),
                revision: String(this.state.revision),
                ...this.pendingPatches(),
            });
            this.state = body.state;
            this.ackEdits(sent);
        } catch (e: any) {
            if (attempt === 0 && e && e.type === 'conflict' && e.state) {
                this.state = e.state;
                await this.syncEdits(1);
                return;
            }
            if (e && e.fieldErrors) {
                this.fieldErrors = e.fieldErrors;
            }
            this.showError(e);
        }
    }

    getFieldErrorRows(): { name: string, message: string }[] {
        return this.fieldErrors
            ? Object.keys(this.fieldErrors).map(name => ({ name: this.fieldLabel(name), message: this.fieldErrors![name] }))
            : [];
    }

    private async run(task: () => Promise<void>) {
        clearTimeout(this.syncTimer);
        this.busy = true;
        this.notice = null;
        try {
            await task();
        } catch (e: any) {
            this.showError(e);
        } finally {
            this.busy = false;
            setTimeout(() => this.ivContent && this.ivContent.scrollToBottom(200));
        }
    }

    private showError(e: any) {
        const err: InterviewError = e && e.type ? e : { type: 'error', message: '' };
        if (err.state) {
            this.state = err.state;
        }
        console.warn('[llm-interview]', err.type, err.message);
        const messages: { [type: string]: string } = {
            rate_limited: this.label('errorRate', 'Too many requests. Please wait a moment.'),
            conflict: this.label('errorConflict', 'Your draft was updated from another window.'),
            llm_invalid: this.label('errorBusy', 'The coach could not answer. Please try again.'),
            validation: this.label('errorInvalid', 'Some values are invalid.'),
            approval_failed: this.label('errorSave', 'Saving failed. Please try again.'),
        };
        const danger = err.type === 'danger_detected';
        this.notice = {
            message: danger ? err.message : (messages[err.type] || this.label('errorGeneric', 'Something went wrong. Please try again.')),
            danger: danger,
        };
    }

    // `state` is the only GET; mutations carry the CSRF token
    private async call(action: string, extra: { [key: string]: string }, method: 'POST' | 'GET' = 'POST'): Promise<any> {
        const config = this.style.interview;
        const params: { [key: string]: string } = {
            '__llm_interview_action': action,
            'section_id': String(config.sectionId),
            ...extra,
        };
        if (this.recordId) {
            params['record_id'] = String(this.recordId);
        }
        let body: any;
        if (method === 'GET') {
            body = await this.selfhelpService.execServerGetRequest(this.url, params);
        } else {
            params['csrf_token'] = config.csrfToken;
            body = await this.selfhelpService.execServerRequest(this.url, params);
        }
        if (!body || body.success !== true) {
            const type = body && body.error && body.error.type ? body.error.type : 'error';
            throw <InterviewError>{
                type: type,
                message: type === 'danger_detected' ? this.blockedMessage(body) : (body && body.error ? body.error.message : ''),
                state: body ? body.state : null,
                fieldErrors: body && body.field_errors && typeof body.field_errors === 'object' ? body.field_errors : null,
            };
        }
        const level = body.safety ? body.safety.danger_level : null;
        if ((body.state && body.state.blocked) || level === 'critical' || level === 'emergency') {
            throw <InterviewError>{ type: 'danger_detected', message: this.blockedMessage(body), state: body.state };
        }
        return body;
    }

    private blockedMessage(body: any): string {
        if (body && typeof body.safety_message === 'string' && body.safety_message.trim() !== '') {
            return body.safety_message;
        }
        if (body && body.safety && body.safety.safety_message) {
            return body.safety.safety_message;
        }
        return (body && body.error && body.error.message) || 'This conversation has been blocked due to safety concerns.';
    }

    private token(prefix: string): string {
        return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    }
}
