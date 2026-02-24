import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    OnDestroy,
    OnChanges,
    SimpleChanges,
    NgZone,
    ViewChild
} from '@angular/core';

export interface ChatTagReason {
    key: string;
    label: string;
    urgency?: string;
}

export interface ChatTherapistInfo {
    id: number;
    display: string;
    name: string;
}

type MentionType = 'therapist' | 'topic' | null;

interface MentionSuggestion {
    type: 'therapist' | 'therapist_all' | 'topic';
    label: string;
    insertText: string;
    icon: string;
    color: string;
}

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
    styleUrls: ['./chat-input.component.scss'],
    standalone: false
})
export class ChatInputComponent implements OnDestroy, OnChanges {
    @Input() placeholder: string = 'Type your message...';
    @Input() disabled: boolean = false;
    @Input() maxLength: number = 4000;
    @Input() showCharCount: boolean = true;
    @Input() rows: number = 2;
    @Input() speechToTextEnabled: boolean = true;
    @Input() appendText: string = '';
    @Input() message: string = '';
    @Input() variant: 'llm' | 'default' = 'llm';
    @Input() showAttachButton: boolean = false;
    @Input() showDisabledAttachButton: boolean = false;
    @Input() attachDisabled: boolean = false;
    @Input() enableFileDrop: boolean = false;
    @Input() fileInputAccept: string = '';
    @Input() fileInputMultiple: boolean = true;
    @Input() showSendSpinner: boolean = false;
    @Input() attachButtonTitle: string = 'Attach files';
    @Input() clearButtonTitle: string = 'Clear';
    @Input() sendButtonTitle: string = 'Send message';

    @Input() taggingEnabled: boolean = false;
    @Input() therapists: ChatTherapistInfo[] = [];
    @Input() tagReasons: ChatTagReason[] = [];

    @Output() messageSend = new EventEmitter<string>();
    @Output() appendTextConsumed = new EventEmitter<void>();
    @Output() messageChange = new EventEmitter<string>();
    @Output() attachRequested = new EventEmitter<void>();
    @Output() filesSelected = new EventEmitter<File[]>();

    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

    showTaggingPanel: boolean = false;

    messageText: string = '';
    isRecording: boolean = false;
    isDragging: boolean = false;
    private recognition: any = null;
    private textBeforeRecording: string = '';

    // Inline mention autocomplete state
    mentionActive: MentionType = null;
    mentionQuery: string = '';
    mentionSuggestions: MentionSuggestion[] = [];
    mentionSelectedIndex: number = 0;
    private mentionTriggerPos: number = -1;

    constructor(private zone: NgZone) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['message'] && changes['message'].currentValue !== undefined) {
            const nextMessage = changes['message'].currentValue || '';
            if (nextMessage !== this.messageText) {
                this.messageText = nextMessage;
            }
        }

        if (changes['appendText'] && changes['appendText'].currentValue) {
            const text = changes['appendText'].currentValue;
            const separator = this.messageText && !this.messageText.match(/\s$/) ? ' ' : '';
            this.setMessageText(this.messageText + separator + text + ' ');
            this.appendTextConsumed.emit();
        }
    }

    ngOnDestroy() {
        this.stopRecording();
    }

    get characterCount(): number {
        return this.messageText.length;
    }

    get isNearLimit(): boolean {
        return this.maxLength > 0 && this.characterCount > this.maxLength * 0.9;
    }

    get canSend(): boolean {
        return this.messageText.trim().length > 0 && !this.disabled;
    }

    get canClear(): boolean {
        return this.messageText.length > 0 && !this.disabled;
    }

    get speechAvailable(): boolean {
        return this.speechToTextEnabled && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }

    onMessageTextChanged(value: string) {
        this.setMessageText(value || '');
        this.detectMentionTrigger(value || '');
    }

    onKeyDown(event: KeyboardEvent) {
        if (this.mentionActive && this.mentionSuggestions.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                this.mentionSelectedIndex = (this.mentionSelectedIndex + 1) % this.mentionSuggestions.length;
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                this.mentionSelectedIndex = (this.mentionSelectedIndex - 1 + this.mentionSuggestions.length) % this.mentionSuggestions.length;
                return;
            }
            if (event.key === 'Enter' || event.key === 'Tab') {
                event.preventDefault();
                this.selectMentionSuggestion(this.mentionSuggestions[this.mentionSelectedIndex]);
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeMentionPopup();
                return;
            }
        }

        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.send();
        }
    }

    send() {
        if (!this.canSend) return;
        this.stopRecording();
        this.closeMentionPopup();
        this.messageSend.emit(this.messageText.trim());
        this.setMessageText('');
    }

    clear() {
        this.setMessageText('');
        this.stopRecording();
        this.closeMentionPopup();
    }

    onAttachClick(): void {
        if (this.disabled || this.attachDisabled) return;
        this.attachRequested.emit();
    }

    openFileDialog(): void {
        if (this.disabled || this.attachDisabled) return;
        this.fileInput?.nativeElement.click();
    }

    onFileInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = input.files ? Array.from(input.files) : [];
        if (files.length > 0) {
            this.filesSelected.emit(files);
        }
        input.value = '';
    }

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        if (!this.enableFileDrop || this.disabled || this.attachDisabled) return;
        this.isDragging = true;
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        if (!this.enableFileDrop) return;
        this.isDragging = false;
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        if (!this.enableFileDrop || this.disabled || this.attachDisabled) {
            this.isDragging = false;
            return;
        }
        this.isDragging = false;
        const files = event.dataTransfer?.files ? Array.from(event.dataTransfer.files) : [];
        if (files.length > 0) {
            this.filesSelected.emit(files);
        }
    }

    get hasTaggingOptions(): boolean {
        return this.taggingEnabled && (this.therapists.length > 0 || this.tagReasons.length > 0);
    }

    toggleTaggingPanel(): void {
        this.showTaggingPanel = !this.showTaggingPanel;
    }

    insertMention(therapist: ChatTherapistInfo): void {
        this.appendTagText('@' + (therapist.display || therapist.name));
    }

    insertMentionAll(): void {
        this.appendTagText('@therapist');
    }

    insertTopic(reason: ChatTagReason): void {
        this.appendTagText('#' + reason.key);
    }

    private appendTagText(text: string): void {
        const separator = this.messageText && !this.messageText.match(/\s$/) ? ' ' : '';
        this.setMessageText(this.messageText + separator + text + ' ');
    }

    // ======== Inline mention autocomplete ========

    private detectMentionTrigger(text: string): void {
        if (!this.taggingEnabled) {
            this.closeMentionPopup();
            return;
        }

        const lastAt = text.lastIndexOf('@');
        const lastHash = text.lastIndexOf('#');

        const triggerPos = Math.max(lastAt, lastHash);
        if (triggerPos < 0) {
            this.closeMentionPopup();
            return;
        }

        const charBefore = triggerPos > 0 ? text[triggerPos - 1] : ' ';
        if (charBefore !== ' ' && charBefore !== '\n' && triggerPos !== 0) {
            this.closeMentionPopup();
            return;
        }

        const query = text.substring(triggerPos + 1);
        if (query.includes(' ') || query.includes('\n')) {
            this.closeMentionPopup();
            return;
        }

        const isMention = text[triggerPos] === '@';
        const type: MentionType = isMention ? 'therapist' : 'topic';
        this.mentionTriggerPos = triggerPos;
        this.mentionQuery = query.toLowerCase();
        this.mentionActive = type;
        this.mentionSelectedIndex = 0;

        this.buildSuggestions();
    }

    private buildSuggestions(): void {
        const suggestions: MentionSuggestion[] = [];
        const q = this.mentionQuery;

        if (this.mentionActive === 'therapist') {
            if ('therapist'.includes(q) || 'all'.includes(q)) {
                suggestions.push({
                    type: 'therapist_all',
                    label: '@therapist (all)',
                    insertText: '@therapist',
                    icon: 'people-outline',
                    color: 'primary'
                });
            }
            for (const t of this.therapists) {
                const name = (t.display || t.name).toLowerCase();
                if (!q || name.includes(q)) {
                    suggestions.push({
                        type: 'therapist',
                        label: '@' + (t.display || t.name),
                        insertText: '@' + (t.display || t.name),
                        icon: 'person-outline',
                        color: 'secondary'
                    });
                }
            }
        } else if (this.mentionActive === 'topic') {
            for (const r of this.tagReasons) {
                const key = (r.key || '').toLowerCase();
                const label = (r.label || '').toLowerCase();
                if (!q || key.includes(q) || label.includes(q)) {
                    suggestions.push({
                        type: 'topic',
                        label: '#' + r.key + (r.label ? ' — ' + r.label : ''),
                        insertText: '#' + r.key,
                        icon: 'pricetag-outline',
                        color: 'tertiary'
                    });
                }
            }
        }

        this.mentionSuggestions = suggestions;
        if (suggestions.length === 0) {
            this.mentionActive = null;
        }
    }

    selectMentionSuggestion(suggestion: MentionSuggestion): void {
        const before = this.messageText.substring(0, this.mentionTriggerPos);
        const after = this.messageText.substring(this.mentionTriggerPos + 1 + this.mentionQuery.length);
        this.setMessageText(before + suggestion.insertText + ' ' + after);
        this.closeMentionPopup();
    }

    closeMentionPopup(): void {
        this.mentionActive = null;
        this.mentionQuery = '';
        this.mentionSuggestions = [];
        this.mentionSelectedIndex = 0;
        this.mentionTriggerPos = -1;
    }

    // ======== Recording ========

    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    private startRecording() {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (!SpeechRecognition) return;

        this.textBeforeRecording = this.messageText;

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = navigator.language || 'en-US';

        this.recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            this.zone.run(() => {
                const base = this.textBeforeRecording;
                const separator = base && !base.match(/\s$/) ? ' ' : '';
                this.setMessageText(base + separator + transcript);
            });
        };

        this.recognition.onerror = () => {
            this.zone.run(() => { this.isRecording = false; });
        };

        this.recognition.onend = () => {
            this.zone.run(() => {
                if (this.isRecording) {
                    this.textBeforeRecording = this.messageText;
                    try { this.recognition.start(); } catch (e) { this.isRecording = false; }
                }
            });
        };

        try {
            this.recognition.start();
            this.isRecording = true;
        } catch (e) {
            this.isRecording = false;
        }
    }

    private stopRecording() {
        this.isRecording = false;
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
            this.recognition = null;
        }
    }

    private setMessageText(value: string): void {
        this.messageText = value;
        this.messageChange.emit(this.messageText);
    }
}
