import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from '../../services/selfhelp.service';
import { AlertController } from '@ionic/angular';

interface DashboardConversation {
    id: number;
    id_users?: string;
    subject_name?: string;
    user_name?: string;
    title?: string;
    last_message_at?: string;
    updated_at?: string;
    unread_count?: number;
    unread_alerts?: number;
    message_count?: number;
    status?: string;
    risk_level?: string;
    ai_enabled?: boolean;
}

interface DashboardAlert {
    id: number;
    type: string;
    message: string;
    created_at: string;
    is_read: boolean;
    conversation_id?: number;
    subject_name?: string;
}

interface ConversationNote {
    id: number;
    content: string;
    note_type: string;
    created_at: string;
    updated_at?: string;
    author_name?: string;
}

interface ChatMessage {
    id?: number;
    role?: string;
    sender_type?: string;
    content: string;
    formatted_content?: string;
    created_at?: string;
    is_deleted?: boolean;
}

@Component({
    selector: 'app-therapist-dashboard-style',
    templateUrl: './therapist-dashboard-style.component.html',
    styleUrls: ['./therapist-dashboard-style.component.scss'],
    standalone: false
})
export class TherapistDashboardStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy {
    conversations: DashboardConversation[] = [];
    alerts: DashboardAlert[] = [];
    stats: any = {};
    sectionId: number | null = null;
    activeTab: 'conversations' | 'alerts' = 'conversations';
    isLoading = false;
    errorMessage = '';

    selectedConversation: DashboardConversation | null = null;
    selectedMessages: ChatMessage[] = [];
    selectedNotes: ConversationNote[] = [];
    isSending = false;
    isLoadingMessages = false;

    conversationTab: 'chat' | 'notes' | 'settings' = 'chat';
    unreadBySubject: { [key: string]: number } = {};

    noteText = '';
    isAddingNote = false;
    editingNoteId: number | null = null;
    editingNoteText = '';

    isGeneratingSummary = false;
    isCreatingDraft = false;
    activeDraft: { id: number; ai_content: string; edited_content: string } | null = null;
    draftEditText = '';
    pendingSummary = '';

    @ViewChild('messagesEnd') messagesEnd?: ElementRef;
    @ViewChild('messagesArea') messagesArea?: ElementRef;

    private pollTimer: any = null;

    private static toBool(val: any): boolean {
        return !(val === false || val === 0 || val === '0' || val === 'false' || val === null);
    }

    constructor(
        private selfhelpService: SelfhelpService,
        private alertController: AlertController
    ) {
        super();
    }

    override ngOnInit() {
        const s: any = this.style;
        this.sectionId = s?.section_id || null;
        if (s?.conversations) {
            this.conversations = s.conversations;
        }
        if (s?.alerts) {
            this.alerts = s.alerts;
        }
        if (s?.stats) {
            this.stats = s.stats;
        }
        if (this.conversations.length === 0) {
            this.loadConversations();
        }
        this.loadUnreadCounts();
        this.startPolling();
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    private startPolling() {
        this.pollTimer = setInterval(() => this.poll(), 5000);
    }

    private stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
    }

    private async poll() {
        if (!this.sectionId) return;
        try {
            const res: any = await this.apiCall('check_updates');
            if (res?.unread_messages !== undefined || res?.unread_alerts !== undefined) {
                this.loadUnreadCounts();
                if (this.selectedConversation) {
                    this.refreshMessages();
                }
            }
        } catch (e) { }
    }

    private async apiCall(action: string, extra: any = {}): Promise<any> {
        const params: any = { action, section_id: this.sectionId, ...extra };
        const res: any = await this.selfhelpService.execServerRequest(this.url, params);
        if (res?.content?.find) {
            return undefined;
        }
        return res;
    }

    async loadConversations() {
        this.isLoading = true;
        try {
            const res: any = await this.apiCall('get_conversations');
            if (res?.conversations) {
                this.conversations = res.conversations;
                for (const c of this.conversations) {
                    c.ai_enabled = TherapistDashboardStyleComponent.toBool(c.ai_enabled);
                }
            }
            if (res?.stats) {
                this.stats = res.stats;
            }
        } catch (e) {
            console.error('Failed to load conversations', e);
        } finally {
            this.isLoading = false;
        }
    }

    async loadUnreadCounts() {
        if (!this.sectionId) return;
        try {
            const res: any = await this.apiCall('get_unread_counts');
            const counts = res?.unread_counts;
            if (counts?.bySubject) {
                this.unreadBySubject = counts.bySubject;
            }
        } catch (e) { }
    }

    getConvUnread(conv: DashboardConversation): number {
        const bySubject = this.unreadBySubject[conv.id_users || ''] || 0;
        return bySubject || conv.unread_alerts || conv.unread_count || 0;
    }

    get totalConversations(): number {
        return this.stats.total_conversations || this.conversations.length;
    }

    get activeConversations(): number {
        return this.stats.active_conversations || this.conversations.filter(c => c.status === 'active').length;
    }

    get unreadAlertCount(): number {
        return this.alerts.filter(a => !a.is_read).length;
    }

    getDisplayName(conv: DashboardConversation): string {
        return conv.subject_name || conv.user_name || 'Patient #' + conv.id;
    }

    getSenderLabel(msg: ChatMessage): string {
        if (msg.sender_type) {
            switch (msg.sender_type) {
                case 'therapist': return 'You';
                case 'subject': return 'Patient';
                case 'system': return 'System';
                case 'ai': case 'assistant': return 'AI';
            }
        }
        if (msg.role === 'therapist') return 'You';
        if (msg.role === 'user') return 'Patient';
        if (msg.role === 'assistant') return 'AI';
        return '';
    }

    getSenderClass(msg: ChatMessage): string {
        if (msg.sender_type) {
            switch (msg.sender_type) {
                case 'therapist': return 'therapist';
                case 'subject': return 'patient';
                case 'system': return 'system';
                case 'ai': case 'assistant': return 'ai';
            }
        }
        if (msg.role === 'therapist') return 'therapist';
        if (msg.role === 'user') return 'patient';
        if (msg.role === 'assistant') return 'ai';
        return 'patient';
    }

    getRiskColor(risk?: string): string {
        switch (risk) {
            case 'critical': case 'emergency': return 'danger';
            case 'high': return 'danger';
            case 'medium': case 'elevated': return 'warning';
            case 'low': return 'success';
            default: return 'medium';
        }
    }

    getStatusColor(status?: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'paused': return 'warning';
            case 'closed': return 'medium';
            default: return 'primary';
        }
    }

    async selectConversation(conv: DashboardConversation) {
        this.selectedConversation = conv;
        this.conversationTab = 'chat';
        this.activeDraft = null;
        this.errorMessage = '';
        this.isLoadingMessages = true;
        try {
            const res: any = await this.apiCall('get_conversation', { conversation_id: conv.id });
            if (res?.messages) {
                this.selectedMessages = res.messages;
            }
            if (res?.notes) {
                this.selectedNotes = res.notes;
            }
            if (res?.conversation) {
                Object.assign(this.selectedConversation!, res.conversation);
                this.selectedConversation!.ai_enabled =
                    TherapistDashboardStyleComponent.toBool(this.selectedConversation!.ai_enabled);
            }
            await this.apiCall('mark_messages_read', { conversation_id: conv.id });
        } catch (e) {
            console.error('Failed to load conversation', e);
        } finally {
            this.isLoadingMessages = false;
            this.scrollToBottom();
        }
    }

    async refreshMessages() {
        if (!this.selectedConversation) return;
        try {
            const lastId = this.getMaxMessageId();
            const res: any = await this.apiCall('get_messages', {
                conversation_id: this.selectedConversation.id,
                after_id: lastId
            });
            const newMsgs = res?.messages || [];
            if (newMsgs.length > 0) {
                const existingIds = new Set(this.selectedMessages.filter(m => m.id).map(m => m.id));
                let added = false;
                for (const msg of newMsgs) {
                    if (!msg.id || !existingIds.has(msg.id)) {
                        this.selectedMessages.push(msg);
                        added = true;
                    }
                }
                if (added) this.scrollToBottom();
            }
        } catch (e) { }
    }

    private getMaxMessageId(): number | null {
        let max: number | null = null;
        for (const m of this.selectedMessages) {
            if (m.id && (max === null || m.id > max)) max = m.id;
        }
        return max;
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.messagesEnd) {
                this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }

    backToList() {
        this.selectedConversation = null;
        this.selectedMessages = [];
        this.selectedNotes = [];
        this.activeDraft = null;
        this.conversationTab = 'chat';
        this.errorMessage = '';
    }

    async onMessageSend(text: string) {
        if (!text.trim() || !this.selectedConversation || this.isSending) return;
        this.isSending = true;
        this.errorMessage = '';
        const tempMsg: ChatMessage = {
            role: 'therapist',
            sender_type: 'therapist',
            content: text,
            created_at: new Date().toISOString()
        };
        this.selectedMessages.push(tempMsg);
        this.scrollToBottom();
        try {
            const res: any = await this.apiCall('send_message', {
                message: text,
                conversation_id: this.selectedConversation.id
            });
            if (res?.message_id) {
                tempMsg.id = res.message_id;
            }
            if (res?.error) {
                this.selectedMessages = this.selectedMessages.filter(m => m !== tempMsg);
                this.errorMessage = res.error;
            }
        } catch (e) {
            this.selectedMessages = this.selectedMessages.filter(m => m !== tempMsg);
            this.errorMessage = 'Failed to send message';
        } finally {
            this.isSending = false;
        }
    }

    async loadAlerts() {
        try {
            const res: any = await this.apiCall('get_alerts');
            if (res?.alerts) {
                this.alerts = res.alerts;
            }
        } catch (e) {
            console.error('Failed to load alerts', e);
        }
    }

    async markAlertRead(alert: DashboardAlert) {
        try {
            await this.apiCall('mark_alert_read', { alert_id: alert.id });
            alert.is_read = true;
        } catch (e) { }
    }

    async markAllAlertsRead() {
        try {
            await this.apiCall('mark_all_read');
            this.alerts.forEach(a => a.is_read = true);
        } catch (e) { }
    }

    onAlertClick(alert: DashboardAlert) {
        this.markAlertRead(alert);
        if (alert.conversation_id) {
            const conv = this.conversations.find(c => c.id === alert.conversation_id);
            if (conv) {
                this.activeTab = 'conversations';
                this.selectConversation(conv);
            }
        }
    }

    async addNote() {
        if (!this.noteText.trim() || !this.selectedConversation || this.isAddingNote) return;
        this.isAddingNote = true;
        try {
            const res: any = await this.apiCall('add_note', {
                conversation_id: this.selectedConversation.id,
                content: this.noteText.trim()
            });
            if (res?.note_id) {
                this.selectedNotes.unshift({
                    id: res.note_id,
                    content: this.noteText.trim(),
                    note_type: 'manual',
                    created_at: new Date().toISOString()
                });
                this.noteText = '';
            }
        } catch (e) {
            console.error('Failed to add note', e);
        } finally {
            this.isAddingNote = false;
        }
    }

    startEditNote(note: ConversationNote) {
        this.editingNoteId = note.id;
        this.editingNoteText = note.content;
    }

    cancelEditNote() {
        this.editingNoteId = null;
        this.editingNoteText = '';
    }

    async saveEditNote(note: ConversationNote) {
        if (!this.editingNoteText.trim()) return;
        try {
            await this.apiCall('edit_note', {
                note_id: note.id,
                content: this.editingNoteText.trim()
            });
            note.content = this.editingNoteText.trim();
            this.cancelEditNote();
        } catch (e) {
            console.error('Failed to edit note', e);
        }
    }

    async deleteNote(note: ConversationNote) {
        const alert = await this.alertController.create({
            header: 'Delete Note',
            message: 'Are you sure you want to delete this note? This action cannot be undone.',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        this.confirmDeleteNote(note);
                    }
                }
            ]
        });
        await alert.present();
    }

    private async confirmDeleteNote(note: ConversationNote) {
        try {
            await this.apiCall('delete_note', { note_id: note.id });
            this.selectedNotes = this.selectedNotes.filter(n => n.id !== note.id);
        } catch (e) {
            console.error('Failed to delete note', e);
        }
    }

    async generateSummary() {
        if (!this.selectedConversation || this.isGeneratingSummary) return;
        this.isGeneratingSummary = true;
        this.errorMessage = '';
        this.conversationTab = 'notes';
        try {
            const res: any = await this.apiCall('generate_summary', {
                conversation_id: this.selectedConversation.id
            });
            if (res?.summary) {
                this.pendingSummary = res.summary;
            }
            if (res?.error) {
                this.errorMessage = 'Summary: ' + res.error;
            }
        } catch (e) {
            this.errorMessage = 'Failed to generate summary';
        } finally {
            this.isGeneratingSummary = false;
        }
    }

    async saveSummaryAsNote() {
        if (!this.pendingSummary || !this.selectedConversation) return;
        try {
            const res: any = await this.apiCall('add_note', {
                conversation_id: this.selectedConversation.id,
                content: this.pendingSummary,
                note_type: 'ai_summary'
            });
            if (res?.note_id) {
                this.selectedNotes.unshift({
                    id: res.note_id,
                    content: this.pendingSummary,
                    note_type: 'ai_summary',
                    created_at: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error('Failed to save summary as note', e);
        }
        this.pendingSummary = '';
    }

    async createAIDraft() {
        if (!this.selectedConversation || this.isCreatingDraft) return;
        this.isCreatingDraft = true;
        this.errorMessage = '';
        try {
            const res: any = await this.apiCall('create_draft', {
                conversation_id: this.selectedConversation.id
            });
            if (res?.draft) {
                this.activeDraft = res.draft;
                this.draftEditText = res.draft.ai_content || res.draft.edited_content || '';
            } else if (res?.ai_content) {
                this.activeDraft = { id: res.id || 0, ai_content: res.ai_content, edited_content: '' };
                this.draftEditText = res.ai_content;
            }
            if (res?.error) {
                this.errorMessage = 'Draft: ' + res.error;
            }
        } catch (e) {
            this.errorMessage = 'Failed to create draft';
        } finally {
            this.isCreatingDraft = false;
        }
    }

    async sendDraft() {
        if (!this.activeDraft || !this.selectedConversation) return;
        this.isSending = true;
        try {
            const res: any = await this.apiCall('send_draft', {
                draft_id: this.activeDraft.id,
                conversation_id: this.selectedConversation.id
            });
            if (res?.success !== false) {
                this.selectedMessages.push({
                    id: res.message_id || undefined,
                    role: 'therapist',
                    sender_type: 'therapist',
                    content: this.draftEditText || this.activeDraft.ai_content,
                    created_at: new Date().toISOString()
                });
                this.activeDraft = null;
                this.draftEditText = '';
                this.scrollToBottom();
            }
        } catch (e) {
            this.errorMessage = 'Failed to send draft';
        } finally {
            this.isSending = false;
        }
    }

    async discardDraft() {
        if (!this.activeDraft) return;
        try {
            await this.apiCall('discard_draft', { draft_id: this.activeDraft.id });
        } catch (e) { }
        this.activeDraft = null;
        this.draftEditText = '';
    }

    async regenerateDraft() {
        if (!this.selectedConversation || this.isCreatingDraft) return;
        this.isCreatingDraft = true;
        this.errorMessage = '';
        try {
            const res: any = await this.apiCall('create_draft', {
                conversation_id: this.selectedConversation.id
            });
            if (res?.draft) {
                this.activeDraft = res.draft;
                this.draftEditText = res.draft.ai_content || res.draft.edited_content || '';
            } else if (res?.ai_content) {
                this.activeDraft = { id: res.id || 0, ai_content: res.ai_content, edited_content: '' };
                this.draftEditText = res.ai_content;
            }
            if (res?.error) {
                this.errorMessage = 'Draft: ' + res.error;
            }
        } catch (e) {
            this.errorMessage = 'Failed to regenerate draft';
        } finally {
            this.isCreatingDraft = false;
        }
    }

    isAIEnabled(): boolean {
        if (!this.selectedConversation) return true;
        return TherapistDashboardStyleComponent.toBool(this.selectedConversation.ai_enabled);
    }

    async setAIMode(enabled: boolean) {
        if (!this.selectedConversation) return;
        if (this.isAIEnabled() === enabled) return;
        try {
            const res: any = await this.apiCall('toggle_ai', {
                conversation_id: this.selectedConversation.id,
                enabled: enabled
            });
            if (res?.success !== false) {
                this.selectedConversation.ai_enabled = enabled;
            }
        } catch (e) {
            console.error('Failed to update AI mode', e);
        }
    }

    async setRisk(level: string) {
        if (!this.selectedConversation) return;
        try {
            const res: any = await this.apiCall('set_risk', {
                conversation_id: this.selectedConversation.id,
                risk_level: level
            });
            if (res?.success !== false) {
                this.selectedConversation.risk_level = level;
            }
        } catch (e) { }
    }

    async setStatus(status: string) {
        if (!this.selectedConversation) return;
        try {
            const res: any = await this.apiCall('set_status', {
                conversation_id: this.selectedConversation.id,
                status: status
            });
            if (res?.success !== false) {
                this.selectedConversation.status = status;
            }
        } catch (e) { }
    }

    onTabChange() {
        if (this.activeTab === 'alerts' && this.alerts.length === 0) {
            this.loadAlerts();
        }
    }

    getMessageContent(msg: ChatMessage): string {
        return msg.formatted_content || msg.content || '';
    }

    formatTime(dateStr?: string): string {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return dateStr; }
    }
}
