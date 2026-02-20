import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { TherapyChatStyle } from '../../selfhelpInterfaces';
import { SelfhelpService } from '../../services/selfhelp.service';

interface TherapyMessage {
    id?: number;
    role: string;
    content: string;
    formatted_content?: string;
    created_at?: string;
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
    sectionId: number | null = null;
    isSubject: boolean = true;
    taggingEnabled: boolean = false;
    labels: any[] = [];

    constructor(private selfhelpService: SelfhelpService) {
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
        if (this.style.messages) {
            this.messages = this.style.messages;
            this.scrollToBottom();
        }
    }

    ngOnDestroy() {}

    async sendMessage() {
        if (!this.messageText.trim() || this.isLoading) return;

        const userMessage = this.messageText.trim();
        this.messageText = '';
        this.messages.push({ role: 'user', content: userMessage });
        this.isLoading = true;
        this.scrollToBottom();

        try {
            const res: any = await this.selfhelpService.execServerRequest(this.url, {
                action: 'send_message',
                message: userMessage,
                conversation_id: this.conversationId,
                section_id: this.sectionId
            });
            if (res && res.message) {
                this.messages.push({ role: 'assistant', content: res.message });
                if (res.conversation_id) {
                    this.conversationId = res.conversation_id;
                }
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

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    private scrollToBottom() {
        setTimeout(() => {
            if (this.messagesEnd) {
                this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
}
