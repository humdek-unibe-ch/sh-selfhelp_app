import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss'],
})
export class ChatMessageComponent {
    @Input() content: string = '';
    @Input() formattedContent: string = '';
    @Input() senderType: string = '';
    @Input() senderLabel: string = '';
    @Input() timestamp: string = '';
    @Input() isOwn: boolean = false;
    @Input() labels: any[] = [];

    get displayContent(): string {
        return this.formattedContent || this.content || '';
    }

    get bubbleType(): string {
        switch (this.senderType) {
            case 'subject':
            case 'user':
            case 'patient':
                return this.isOwn ? 'own' : 'patient';
            case 'therapist':
                return this.isOwn ? 'own' : 'therapist';
            case 'ai':
            case 'assistant':
                return 'ai';
            case 'system':
                return 'system';
            default:
                return this.isOwn ? 'own' : 'other';
        }
    }
}
