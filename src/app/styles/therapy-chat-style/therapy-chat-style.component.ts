import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, NgZone } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { TherapyChatStyle } from '../../selfhelpInterfaces';
import { SelfhelpService } from '../../services/selfhelp.service';
import { ChatTagReason, ChatTherapistInfo } from '../../components/chat-input/chat-input.component';

interface TherapyMessage {
    id?: number;
    role: string;
    content: string;
    formatted_content?: string;
    created_at?: string;
    sender_type?: string;
    label?: string;
    labels?: any[];
}

@Component({
    selector: 'app-therapy-chat-style',
    templateUrl: './therapy-chat-style.component.html',
    styleUrls: ['./therapy-chat-style.component.scss'],
    standalone: false
})
export class TherapyChatStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy {
    @Input() override style!: TherapyChatStyle;
    @ViewChild('messagesEnd') messagesEnd!: ElementRef;

    messages: TherapyMessage[] = [];
    conversationId: number | null = null;
    messageText: string = '';
    isLoading: boolean = false;
    isInitialLoading: boolean = true;
    sectionId: number | null = null;
    isSubject: boolean = true;
    taggingEnabled: boolean = false;
    labels: any[] = [];
    unreadCount: number = 0;

    tagReasons: ChatTagReason[] = [];
    therapists: ChatTherapistInfo[] = [];
    helpText: string = '';

    private pollingTimer: any = null;
    private pollingInterval: number = 3000;
    private latestMessageId: number | null = null;
    private isDestroyed: boolean = false;

    constructor(private selfhelpService: SelfhelpService, private zone: NgZone) {
        super();
    }

    override ngOnInit() {
        this.sectionId = this.style.section_id || null;
        this.isSubject = this.style.is_subject !== false;
        this.taggingEnabled = this.style.tagging_enabled === true;
        this.labels = this.style.labels || [];

        const reasonsField = (this.style as any)?.therapy_tag_reasons;
        if (reasonsField?.content && Array.isArray(reasonsField.content)) {
            this.tagReasons = reasonsField.content;
        } else if (Array.isArray(reasonsField)) {
            this.tagReasons = reasonsField;
        }

        if (this.style.conversation) {
            this.conversationId = this.style.conversation.id;
        }
        if (this.style.messages && this.style.messages.length > 0) {
            this.messages = this.style.messages;
            this.latestMessageId = this.getMaxMessageId(this.messages);
            this.isInitialLoading = false;
            this.scrollToBottom();
            this.markAsRead();
        } else {
            this.loadConversation();
        }

        if (this.isSubject) {
            this.loadConfig();
        } else if (this.taggingEnabled) {
            this.loadTherapists();
        }

        this.startPolling();
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        this.stopPolling();
    }

    async loadConfig() {
        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'get_config',
                section_id: this.sectionId
            });
            if (res && res.config) {
                this.taggingEnabled = res.config.taggingEnabled === true || res.config.tagging_enabled === true || this.taggingEnabled;
                if (res.config.tagReasons && Array.isArray(res.config.tagReasons)) {
                    this.tagReasons = res.config.tagReasons.map((r: any) => ({
                        key: r.key || r.code || '',
                        label: r.label || '',
                        urgency: r.urgency
                    }));
                }
                if (res.config.labels && res.config.labels.chat_help_text) {
                    let txt = res.config.labels.chat_help_text;
                    txt = txt.replace(/^<p>\s*/i, '').replace(/\s*<\/p>\s*$/i, '');
                    this.helpText = txt;
                }
            }
        } catch (e) {
            // Config loading is non-fatal
        }

        if (this.taggingEnabled) {
            this.loadTherapists();
        }
    }

    async loadTherapists() {
        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'get_therapists',
                section_id: this.sectionId
            });
            if (res && res.therapists) {
                this.therapists = res.therapists;
            }
        } catch (e) {
            // Non-fatal
        }
    }

    async loadConversation() {
        this.isInitialLoading = true;
        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'get_conversation',
                section_id: this.sectionId,
                ...(this.conversationId ? { conversation_id: this.conversationId } : {})
            });
            if (res && res.conversation) {
                this.conversationId = res.conversation.id;
            }
            if (res && res.messages) {
                this.messages = res.messages;
                this.latestMessageId = this.getMaxMessageId(this.messages);
            }
        } catch (e) {
            console.error('TherapyChat: Failed to load conversation', e);
        } finally {
            this.isInitialLoading = false;
            this.scrollToBottom();
            this.markAsRead();
        }
    }

    async onMessageSend(text: string) {
        await this.sendMessage(text);
    }

    async sendMessage(userMessage?: string) {
        if (!userMessage && (!this.messageText.trim() || this.isLoading)) return;
        if (!userMessage) {
            userMessage = this.messageText.trim();
            this.messageText = '';
        }
        this.messages.push({ role: 'user', content: userMessage, sender_type: 'subject' });
        this.isLoading = true;
        this.scrollToBottom();

        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'send_message',
                message: userMessage,
                conversation_id: this.conversationId,
                section_id: this.sectionId
            });
            if (res && res.conversation_id) {
                this.conversationId = res.conversation_id;
            }
            if (res && res.ai_message) {
                this.messages.push(res.ai_message);
                if (res.ai_message.id) {
                    this.latestMessageId = Math.max(this.latestMessageId || 0, res.ai_message.id);
                }
            }
            if (res && res.message_id) {
                this.latestMessageId = Math.max(this.latestMessageId || 0, res.message_id);
            }
            if (res && res.error) {
                this.messages.push({ role: 'assistant', content: 'Error: ' + res.error });
            }
        } catch (e) {
            this.messages.push({ role: 'assistant', content: 'Failed to get response. Please try again.' });
        } finally {
            this.isLoading = false;
            this.scrollToBottom();
        }
    }

    getEffectiveSenderType(msg: TherapyMessage): string {
        if (msg.sender_type) return msg.sender_type;
        if (msg.label) {
            const lbl = msg.label.toLowerCase();
            if (lbl.includes('therapist')) return 'therapist';
            if (lbl.includes('ai') || lbl.includes('assistant')) return 'ai';
            if (lbl.includes('system')) return 'system';
        }
        return msg.role || 'user';
    }

    isOwnMessage(msg: TherapyMessage): boolean {
        const type = this.getEffectiveSenderType(msg);
        return type === 'subject' || type === 'user';
    }

    getSenderLabel(msg: TherapyMessage): string {
        if (msg.label) return msg.label;
        switch (this.getEffectiveSenderType(msg)) {
            case 'ai':
            case 'assistant': return 'AI Assistant';
            case 'therapist': return 'Therapist';
            case 'subject':
            case 'user': return '';
            case 'system': return 'System';
            default: return '';
        }
    }

    private startPolling() {
        this.stopPolling();
        this.pollingTimer = setInterval(() => this.checkUpdates(), this.pollingInterval);
    }

    private stopPolling() {
        if (this.pollingTimer) {
            clearInterval(this.pollingTimer);
            this.pollingTimer = null;
        }
    }

    private async checkUpdates() {
        if (this.isDestroyed || this.isLoading) return;

        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'check_updates',
                section_id: this.sectionId
            });

            if (res && res.latest_message_id && res.latest_message_id !== this.latestMessageId) {
                await this.fetchNewMessages();
            }
            if (res && res.unread_count !== undefined) {
                this.zone.run(() => {
                    this.unreadCount = res.unread_count;
                });
            }
        } catch (e) {
            // Polling errors are non-fatal
        }
    }

    private async fetchNewMessages() {
        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'get_messages',
                section_id: this.sectionId,
                conversation_id: this.conversationId,
                ...(this.latestMessageId ? { after_id: this.latestMessageId } : {})
            });

            if (res && res.messages && res.messages.length > 0) {
                this.zone.run(() => {
                    const existingIds = new Set(this.messages.filter(m => m.id).map(m => m.id));
                    for (const msg of res.messages) {
                        if (!msg.id || !existingIds.has(msg.id)) {
                            this.messages.push(msg);
                        }
                    }
                    this.latestMessageId = this.getMaxMessageId(res.messages);
                    this.scrollToBottom();
                });
            }

            this.markAsRead();
        } catch (e) {
            console.error('TherapyChat: Failed to fetch new messages', e);
        }
    }

    private markAsRead() {
        if (!this.conversationId) return;
        this.selfhelpService.execServerRequest(this.url, {
            action: 'mark_messages_read',
            section_id: this.sectionId,
            conversation_id: this.conversationId
        }).catch(() => {});
    }

    private getMaxMessageId(messages: TherapyMessage[]): number | null {
        let maxId: number | null = null;
        for (const msg of messages) {
            if (msg.id && (maxId === null || msg.id > maxId)) {
                maxId = msg.id;
            }
        }
        return maxId;
    }

    private scrollToBottom() {
        setTimeout(() => {
            if (this.messagesEnd) {
                this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
}
