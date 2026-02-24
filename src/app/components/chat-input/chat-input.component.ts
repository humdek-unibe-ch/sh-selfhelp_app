import { Component, EventEmitter, Input, Output, OnDestroy, OnChanges, SimpleChanges, NgZone } from '@angular/core';

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
    styleUrls: ['./chat-input.component.scss'],
})
export class ChatInputComponent implements OnDestroy, OnChanges {
    @Input() placeholder: string = 'Type your message...';
    @Input() disabled: boolean = false;
    @Input() maxLength: number = 4000;
    @Input() showCharCount: boolean = true;
    @Input() rows: number = 2;
    @Input() speechToTextEnabled: boolean = true;
    @Input() appendText: string = '';

    @Output() messageSend = new EventEmitter<string>();
    @Output() appendTextConsumed = new EventEmitter<void>();

    messageText: string = '';
    isRecording: boolean = false;
    private recognition: any = null;
    private textBeforeRecording: string = '';

    constructor(private zone: NgZone) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['appendText'] && changes['appendText'].currentValue) {
            const text = changes['appendText'].currentValue;
            const separator = this.messageText && !this.messageText.match(/\s$/) ? ' ' : '';
            this.messageText += separator + text + ' ';
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

    get speechAvailable(): boolean {
        return this.speechToTextEnabled && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.send();
        }
    }

    send() {
        if (!this.canSend) return;
        this.stopRecording();
        this.messageSend.emit(this.messageText.trim());
        this.messageText = '';
    }

    clear() {
        this.messageText = '';
        this.stopRecording();
    }

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
                this.messageText = base + separator + transcript;
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
}
