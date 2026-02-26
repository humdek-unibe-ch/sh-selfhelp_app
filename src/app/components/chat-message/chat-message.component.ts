import { Component, Input } from '@angular/core';

interface ColorEntry {
    bg: string;
    text: string;
    border: string;
}

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss'],
    standalone: false
})
export class ChatMessageComponent {
    @Input() content: string = '';
    @Input() formattedContent: string = '';
    @Input() senderType: string = '';
    @Input() senderLabel: string = '';
    @Input() senderName: string = '';
    @Input() timestamp: string = '';
    @Input() isOwn: boolean = false;
    @Input() labels: any[] = [];
    @Input() colorEntry: ColorEntry | null = null;

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
            case 'other-therapist':
                return 'therapist';
            case 'ai':
            case 'assistant':
                return 'ai';
            case 'system':
                return 'system';
            default:
                return this.isOwn ? 'own' : 'other';
        }
    }

    get formattedTimestamp(): string {
        if (!this.timestamp) return '';
        try {
            const d = new Date(this.timestamp);
            if (isNaN(d.getTime())) return this.timestamp;
            const now = new Date();
            const day = String(d.getDate()).padStart(2, '0');
            const mon = String(d.getMonth() + 1).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            const isToday = d.getDate() === now.getDate()
                && d.getMonth() === now.getMonth()
                && d.getFullYear() === now.getFullYear();
            if (isToday) {
                return `${hh}:${mm}`;
            }
            const isSameYear = d.getFullYear() === now.getFullYear();
            if (isSameYear) {
                return `${day}.${mon} ${hh}:${mm}`;
            }
            return `${day}.${mon}.${d.getFullYear()} ${hh}:${mm}`;
        } catch {
            return this.timestamp;
        }
    }
}
