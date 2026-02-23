import { Component, OnInit, Input } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { TherapistDashboardStyle } from '../../selfhelpInterfaces';
import { SelfhelpService } from '../../services/selfhelp.service';

interface DashboardConversation {
    id: number;
    subject_name?: string;
    user_name?: string;
    title?: string;
    last_message_at?: string;
    unread_count?: number;
    status?: string;
    risk_level?: string;
}

interface DashboardAlert {
    id: number;
    type: string;
    message: string;
    created_at: string;
    is_read: boolean;
    conversation_id?: number;
}

@Component({
    selector: 'app-therapist-dashboard-style',
    templateUrl: './therapist-dashboard-style.component.html',
    styleUrls: ['./therapist-dashboard-style.component.scss'],
})
export class TherapistDashboardStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: TherapistDashboardStyle;

    conversations: DashboardConversation[] = [];
    alerts: DashboardAlert[] = [];
    stats: any = {};
    selectedConversation: DashboardConversation | null = null;
    selectedMessages: any[] = [];
    sectionId: number | null = null;
    isLoading: boolean = false;
    activeTab: 'conversations' | 'alerts' = 'conversations';
    messageText: string = '';
    isSending: boolean = false;

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
    }

    get totalConversations(): number {
        return this.stats.total_conversations || this.conversations.length;
    }

    get activeConversations(): number {
        return this.stats.active_conversations || this.conversations.filter(c => c.status === 'active').length;
    }

    get unreadAlerts(): number {
        return this.alerts.filter(a => !a.is_read).length;
    }

    async selectConversation(conversation: DashboardConversation) {
        this.selectedConversation = conversation;
        this.isLoading = true;
        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'get_messages',
                conversation_id: conversation.id,
                section_id: this.sectionId
            });
            if (res && res.messages) {
                this.selectedMessages = res.messages;
            } else if (res && res.data && res.data.messages) {
                this.selectedMessages = res.data.messages;
            }
        } catch (e) {
            console.error('Failed to load messages', e);
        } finally {
            this.isLoading = false;
        }
    }

    async onTherapistMessageSend(text: string) {
        await this.sendTherapistMessage(text);
    }

    async sendTherapistMessage(text?: string) {
        if (!text && (!this.messageText.trim() || this.isSending || !this.selectedConversation)) return;
        if (!text) {
            text = this.messageText.trim();
            this.messageText = '';
        }
        if (!this.selectedConversation) return;
        this.isSending = true;

        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'send_message',
                message: text,
                conversation_id: this.selectedConversation.id,
                section_id: this.sectionId
            });
            if (res && !res.error) {
                this.selectedMessages.push({ role: 'therapist', content: text });
            }
        } catch (e) {
            console.error('Failed to send message', e);
        } finally {
            this.isSending = false;
        }
    }

    async markAlertRead(alert: DashboardAlert) {
        try {
            await this.selfhelpService.execServerRequest(this.url, {
                action: 'mark_alert_read',
                alert_id: alert.id,
                section_id: this.sectionId
            });
            alert.is_read = true;
        } catch (e) {
            console.error('Failed to mark alert read', e);
        }
    }

    backToList() {
        this.selectedConversation = null;
        this.selectedMessages = [];
    }

    getRiskBadgeColor(risk: string | undefined): string {
        switch (risk) {
            case 'high': case 'emergency': case 'critical': return 'danger';
            case 'medium': case 'elevated': return 'warning';
            case 'low': return 'success';
            default: return 'medium';
        }
    }

    getStatusColor(status: string | undefined): string {
        switch (status) {
            case 'active': return 'success';
            case 'paused': return 'warning';
            case 'closed': return 'medium';
            default: return 'primary';
        }
    }
}
