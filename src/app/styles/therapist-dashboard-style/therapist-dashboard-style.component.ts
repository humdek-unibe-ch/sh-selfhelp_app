import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { TherapistDashboardStyle } from '../../selfhelpInterfaces';
import { SelfhelpService } from '../../services/selfhelp.service';

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
})
export class TherapistDashboardStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy {
    @Input() override style!: TherapistDashboardStyle;

    conversations: DashboardConversation[] = [];
    alerts: DashboardAlert[] = [];
    stats: any = {};
    sectionId: number | null = null;
    activeTab: 'conversations' | 'alerts' = 'conversations';
    isLoading = false;

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

    private pollTimer: any = null;

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        this.sectionId = this.style.section_id || null;
        if (this.style.conversations) {
            this.conversations = this.style.conversations;
        }
        if (this.style.alerts) {
            this.alerts = this.style.alerts;
        }
        if (this.style.stats) {
            this.stats = this.style.stats;
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
        if (res?.content) {
            return res.content.find ? undefined : res;
        }
        return res;
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
        if (msg.sender_type === 'subject' || msg.role === 'user') return 'Patient';
        if (msg.sender_type === 'therapist' || msg.role === 'therapist') return 'Therapist';
        return 'AI';
    }

    getSenderClass(msg: ChatMessage): string {
        if (msg.sender_type === 'subject' || msg.role === 'user') return 'patient';
        if (msg.sender_type === 'therapist' || msg.role === 'therapist') return 'therapist';
        return 'ai';
    }

    getRiskColor(risk?: string): string {
        switch (risk) {
            case 'critical': case 'emergency': case 'high': return 'danger';
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

    // === CONVERSATION SELECTION ===

    async selectConversation(conv: DashboardConversation) {
        this.selectedConversation = conv;
        this.conversationTab = 'chat';
        this.activeDraft = null;
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
            }
            await this.apiCall('mark_messages_read', { conversation_id: conv.id });
        } catch (e) {
            console.error('Failed to load conversation', e);
        } finally {
            this.isLoadingMessages = false;
        }
    }

    async refreshMessages() {
        if (!this.selectedConversation) return;
        try {
            const lastId = this.selectedMessages.length > 0
                ? this.selectedMessages[this.selectedMessages.length - 1].id
                : null;
            const res: any = await this.apiCall('get_messages', {
                conversation_id: this.selectedConversation.id,
                after_id: lastId
            });
            const newMsgs = res?.messages || [];
            if (newMsgs.length > 0) {
                this.selectedMessages = [...this.selectedMessages, ...newMsgs];
            }
        } catch (e) { }
    }

    backToList() {
        this.selectedConversation = null;
        this.selectedMessages = [];
        this.selectedNotes = [];
        this.activeDraft = null;
        this.conversationTab = 'chat';
    }

    // === MESSAGING ===

    async onMessageSend(text: string) {
        if (!text.trim() || !this.selectedConversation || this.isSending) return;
        this.isSending = true;
        try {
            const res: any = await this.apiCall('send_message', {
                message: text,
                conversation_id: this.selectedConversation.id
            });
            if (res && !res.error) {
                this.selectedMessages.push({
                    role: 'therapist',
                    sender_type: 'therapist',
                    content: text,
                    created_at: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error('Failed to send message', e);
        } finally {
            this.isSending = false;
        }
    }

    // === ALERTS ===

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
        } catch (e) {
            console.error('Failed to mark alert read', e);
        }
    }

    async markAllAlertsRead() {
        try {
            await this.apiCall('mark_all_read');
            this.alerts.forEach(a => a.is_read = true);
        } catch (e) {
            console.error('Failed to mark all read', e);
        }
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

    // === NOTES ===

    async addNote() {
        if (!this.noteText.trim() || !this.selectedConversation || this.isAddingNote) return;
        this.isAddingNote = true;
        try {
            const res: any = await this.apiCall('add_note', {
                conversation_id: this.selectedConversation.id,
                content: this.noteText.trim()
            });
            if (res?.note_id) {
                this.selectedNotes.push({
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
        try {
            await this.apiCall('delete_note', { note_id: note.id });
            this.selectedNotes = this.selectedNotes.filter(n => n.id !== note.id);
        } catch (e) {
            console.error('Failed to delete note', e);
        }
    }

    // === AI FEATURES ===

    async generateSummary() {
        if (!this.selectedConversation || this.isGeneratingSummary) return;
        this.isGeneratingSummary = true;
        try {
            const res: any = await this.apiCall('generate_summary', {
                conversation_id: this.selectedConversation.id
            });
            if (res?.summary) {
                this.selectedNotes.push({
                    id: res.summary_conversation_id || Date.now(),
                    content: res.summary,
                    note_type: 'ai_summary',
                    created_at: new Date().toISOString()
                });
                this.conversationTab = 'notes';
            }
            if (res?.error) {
                console.error('Summary generation failed:', res.error);
            }
        } catch (e) {
            console.error('Failed to generate summary', e);
        } finally {
            this.isGeneratingSummary = false;
        }
    }

    async createAIDraft() {
        if (!this.selectedConversation || this.isCreatingDraft) return;
        this.isCreatingDraft = true;
        try {
            const res: any = await this.apiCall('create_draft', {
                conversation_id: this.selectedConversation.id
            });
            if (res?.success !== false && res?.draft) {
                this.activeDraft = res.draft;
                this.draftEditText = res.draft.ai_content || '';
            } else if (res?.ai_content) {
                this.activeDraft = { id: res.id || 0, ai_content: res.ai_content, edited_content: '' };
                this.draftEditText = res.ai_content;
            }
            if (res?.error) {
                console.error('Draft creation failed:', res.error);
            }
        } catch (e) {
            console.error('Failed to create draft', e);
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
                    role: 'therapist',
                    sender_type: 'therapist',
                    content: this.draftEditText || this.activeDraft.ai_content,
                    created_at: new Date().toISOString()
                });
                this.activeDraft = null;
                this.draftEditText = '';
            }
        } catch (e) {
            console.error('Failed to send draft', e);
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

    // === CONVERSATION SETTINGS ===

    async toggleAI() {
        if (!this.selectedConversation) return;
        const newVal = !this.selectedConversation.ai_enabled;
        try {
            const res: any = await this.apiCall('toggle_ai', {
                conversation_id: this.selectedConversation.id,
                enabled: newVal
            });
            if (res?.success !== false) {
                this.selectedConversation.ai_enabled = newVal;
            }
        } catch (e) {
            console.error('Failed to toggle AI', e);
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
        } catch (e) {
            console.error('Failed to set risk', e);
        }
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
        } catch (e) {
            console.error('Failed to set status', e);
        }
    }

    onTabChange() {
        if (this.activeTab === 'alerts' && this.alerts.length === 0) {
            this.loadAlerts();
        }
    }
}
