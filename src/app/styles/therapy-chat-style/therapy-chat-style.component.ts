import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, NgZone } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { TherapyChatStyle } from '../../selfhelpInterfaces';
import { SelfhelpService } from '../../services/selfhelp.service';

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

        if (this.style.conversation) {
            this.conversationId = this.style.conversation.id;
        }
        if (this.style.messages && this.style.messages.length > 0) {
            this.messages = this.style.messages;
            this.latestMessageId = this.getMaxMessageId(this.messages);
            this.isInitialLoading = false;
            this.scrollToBottom();
        } else {
            this.loadConversation();
        }

        this.startPolling();
    }

    ngOnDestroy() {
        this.isDestroyed = true;
        this.stopPolling();
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

    getSenderLabel(msg: TherapyMessage): string {
        if (msg.label) return msg.label;
        switch (msg.sender_type || msg.role) {
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

            // Mark as read
            this.selfhelpService.execServerRequest(this.url, {
                action: 'mark_messages_read',
                section_id: this.sectionId,
                conversation_id: this.conversationId
            }).catch(() => {});
        } catch (e) {
            console.error('TherapyChat: Failed to fetch new messages', e);
        }
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
