import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormUserInputLogListStyle, LogListRowAction, Style } from 'src/app/selfhelpInterfaces';
import { FormUserInputStyleComponent } from '../form-user-input-style/form-user-input-style.component';

/**
 * Mobile side of the core formUserInputLogList. Edit requests the page with
 * ?record=<id>&sid=<section> so the server returns the form filled with that record.
 */
@Component({
    selector: 'app-form-user-input-log-list-style',
    templateUrl: './form-user-input-log-list-style.component.html',
    styleUrls: ['./form-user-input-log-list-style.component.scss'],
    standalone: false
})
export class FormUserInputLogListStyleComponent extends FormUserInputStyleComponent implements OnInit, OnDestroy {
    @Input() override style!: FormUserInputLogListStyle;
    private openModals = new Set<HTMLIonModalElement>();
    // llmFormLogList binds this to open its interview (null = new)
    @Output() openRecord = new EventEmitter<number | null>();
    formMode: 'closed' | 'new' | 'edit' = 'closed';
    formStyle: Style | null = null;
    loadingRecordId: number | null = null;
    dialog: {
        title: string, content: string, confirmLabel: string, confirmColor: string,
        cancelLabel?: string, run: () => Promise<any>
    } | null = null;

    override ngOnInit() {
        if (!this.isListShown()) {
            this.openNew();
        }
    }

    ngOnDestroy() {
        this.dismissModals();
    }

    // A write refreshes the page: Ionic shows a new page instance and parks this one
    // without change detection, so [isOpen] would never close an open modal
    private dismissModals() {
        this.openModals.forEach(modal => modal.dismiss());
    }

    trackModal(event: Event, open: boolean) {
        const modal = event.target as HTMLIonModalElement;
        if (open) {
            this.openModals.add(modal);
        } else {
            this.openModals.delete(modal);
        }
    }

    isListShown(): boolean {
        return this.getFieldContent('show_list') !== '0';
    }

    isFormOpen(): boolean {
        return this.formMode !== 'closed' && this.formStyle !== null;
    }

    hasActions(): boolean {
        return this.style.list_rows.some(row => this.getRowActions(this.getRecordId(row)).length > 0);
    }

    // As the core model resolves them; `when` fields must be plain list columns, else hidden
    getRowActions(recordId: number): LogListRowAction[] {
        const row = this.style.list_rows.find(r => this.getRecordId(r) === recordId) || {};
        const quick = this.getQuickActions();
        const labels = this.getJsonField('quick_actions_labels') || {};
        const actions: LogListRowAction[] = [];
        for (const key of this.getActionsOrder(quick.map(a => a.id))) {
            if (key === 'edit') {
                if (this.style.label_edit !== '') {
                    actions.push({ id: 'edit' });
                }
            } else if (key === 'delete') {
                if (this.style.can_delete) {
                    actions.push({ id: 'delete' });
                }
            } else {
                const action = quick.find(a => a.id === key);
                if (action && this.quickActionMatches(action.when, row)) {
                    const label = labels[key] || 'Action';
                    actions.push({
                        id: key,
                        label: label,
                        confirm: !!action.confirm,
                        confirm_title: labels[key + '_confirm_title'] || label,
                        confirm_message: labels[key + '_confirm'] || labels['_default_confirm'] || 'Do you want to continue?',
                    });
                }
            }
        }
        return actions;
    }

    quickAction(recordId: number, action: LogListRowAction) {
        const run = () => this.selfhelpService.submitForm(this.url, {
            '__form_name': this.getFieldContent('name'),
            'quick_action_id': action.id,
            'selected_record_id': recordId
        });
        if (!action.confirm) {
            run();
            return;
        }
        const labels = this.getJsonField('quick_actions_labels') || {};
        this.dialog = {
            title: action.confirm_title || '',
            content: action.confirm_message || '',
            confirmLabel: labels['_ok'] || 'OK',
            confirmColor: 'primary',
            cancelLabel: labels['_cancel'] || 'Cancel',
            run: run
        };
    }

    // Arrives decoded or as a JSON string
    private getJsonField(name: string): any {
        const value = this.getFieldContent(name);
        if (typeof value !== 'string') {
            return value || null;
        }
        try {
            return value.trim() ? JSON.parse(value) : null;
        } catch (e) {
            return null;
        }
    }

    private getQuickActions(): { id: string, when: { [field: string]: any }, confirm?: boolean }[] {
        const raw = this.getJsonField('quick_actions');
        const seen: { [id: string]: boolean } = {};
        return (Array.isArray(raw) ? raw : []).filter(a => {
            const id = a && typeof a.id === 'string' ? a.id.trim() : '';
            const valid = id !== '' && id !== 'edit' && id !== 'delete' && !seen[id]
                && a.when && typeof a.when === 'object' && Object.keys(a.when).length > 0
                && a.set && typeof a.set === 'object' && Object.keys(a.set).length > 0;
            if (valid) {
                seen[id] = true;
                a.id = id;
            }
            return valid;
        });
    }

    // Empty: edit, quick, delete; else the listed keys plus unlisted quick ids
    private getActionsOrder(quickIds: string[]): string[] {
        const order = this.getJsonField('actions_order');
        if (!Array.isArray(order) || order.length === 0) {
            return ['edit', ...quickIds, 'delete'];
        }
        const resolved: string[] = [];
        for (const raw of order) {
            const key = String(raw).trim();
            if (key && !resolved.includes(key) && (key === 'edit' || key === 'delete' || quickIds.includes(key))) {
                resolved.push(key);
            }
        }
        return [...resolved, ...quickIds.filter(id => !resolved.includes(id))];
    }

    private quickActionMatches(when: { [field: string]: any }, row: { [header: string]: any }): boolean {
        const fieldsMap = this.getJsonField('fields_map');
        const valuesMap = this.getJsonField('values_map') || {};
        const hasMap = fieldsMap && typeof fieldsMap === 'object' && Object.keys(fieldsMap).length > 0;
        return Object.keys(when).every(field => {
            const header = hasMap ? fieldsMap[field] : field;
            if (!header || valuesMap[field] || !(header in row)) {
                return false;
            }
            return String(row[header] ?? '') === String(when[field]);
        });
    }

    getRecordId(row: any): number {
        return Number(row['record_id']);
    }

    getRootCss(): string {
        return ['formUserInputLogList',
            'formUserInputLogList-layout-' + this.style.list_layout,
            'formUserInputLogList-actions-' + this.style.actions_position,
            this.getCss()].join(' ');
    }

    // values_map HTML: root-relative asset paths point at the server
    getCellHtml(value: any): string {
        const html = value === null || value === undefined ? '' : String(value);
        let origin = '';
        try {
            origin = new URL(this.selfhelpService.getApiEndPointNative()).origin;
        } catch (e) {
            return html;
        }
        return html.replace(/(src|href)="\/(?!\/)/g, '$1="' + origin + '/');
    }

    openNew() {
        if (this.openRecord.observed) {
            this.openRecord.emit(null);
            return;
        }
        this.initForm(this.style);
        this.formStyle = this.style;
        this.formMode = 'new';
    }

    async openEdit(recordId: number) {
        if (this.openRecord.observed) {
            this.openRecord.emit(recordId);
            return;
        }
        this.loadingRecordId = recordId;
        try {
            const sep = this.url.includes('?') ? '&' : '?';
            const res = await this.selfhelpService.execServerRequest(
                this.url + sep + 'record=' + recordId + '&sid=' + this.style.id.content, {});
            const section = this.findSection(res && res.content ? res.content : []);
            if (!section || section.record_access_denied) {
                this.selfhelpService.presentToast('The entry is not available anymore.', 'danger');
                await this.selfhelpService.getPage(this.url);
                return;
            }
            this.initForm(section);
            this.formStyle = section;
            this.formMode = 'edit';
        } finally {
            this.loadingRecordId = null;
        }
    }

    closeForm() {
        this.formMode = 'closed';
        this.formStyle = null;
        this.dismissModals();
        if (!this.isListShown()) {
            this.openNew();
        }
    }

    // The list refreshes with the page, so on success only the form closes.
    override async submitForm(value: { [key: string]: any; }) {
        this.isSubmitting = true;
        try {
            if (await this.selfhelpService.submitForm(this.url, this.prepareParams(value))) {
                this.closeForm();
                if (this.getFieldContent('redirect_at_end') != '') {
                    this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
                }
            }
        } finally {
            this.isSubmitting = false;
        }
    }

    // Web delete modal: empty texts fall back to the field defaults, as the web view does
    confirmDelete(recordId: number) {
        this.dialog = {
            title: this.getFieldContent('delete_title') || this.getFieldDefaut('delete_title') || 'Remove Entry',
            content: this.getFieldContent('delete_content') || this.getFieldDefaut('delete_content') || 'Do you want to remove the entry?',
            confirmLabel: this.style.label_delete,
            confirmColor: 'danger',
            run: () => this.selfhelpService.submitForm(this.url, {
                '__form_name': this.getFieldContent('name'),
                'delete_record_id': recordId
            })
        };
    }

    confirmDialog() {
        const run = this.dialog ? this.dialog.run : null;
        this.dialog = null;
        this.dismissModals();
        if (run) {
            run();
        }
    }

    private findSection(styles: any[]): any {
        for (const s of styles) {
            if (!s) {
                continue;
            }
            if (s.style_name === this.style.style_name && s.id && s.id.content == this.style.id.content) {
                return s;
            }
            const found = s.children ? this.findSection(s.children) : null;
            if (found) {
                return found;
            }
        }
        return null;
    }
}
