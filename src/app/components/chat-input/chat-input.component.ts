import { Component, EventEmitter, Input, Output, OnDestroy, NgZone } from '@angular/core';

@Component({
    selector: 'app-chat-input',
    templateUrl: './chat-input.component.html',
    styleUrls: ['./chat-input.component.scss'],
})
export class ChatInputComponent implements OnDestroy {
    @Input() placeholder: string = 'Type your message...';
    @Input() disabled: boolean = false;
    @Input() maxLength: number = 4000;
    @Input() showCharCount: boolean = true;
    @Input() rows: number = 1;
    @Input() speechToTextEnabled: boolean = true;

    @Output() messageSend = new EventEmitter<string>();

    messageText: string = '';
    isRecording: boolean = false;
    private recognition: any = null;

    constructor(private zone: NgZone) {}

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
        this.messageSend.emit(this.messageText.trim());
        this.messageText = '';
    }

    clear() {
        this.messageText = '';
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

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = navigator.language || 'en-US';

        let finalTranscript = '';

        this.recognition.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            this.zone.run(() => {
                const base = this.messageText.replace(/\s*\[.*?\]\s*$/, '').replace(/\s+$/, '');
                const prefix = base ? base + ' ' : '';
                if (interim) {
                    this.messageText = prefix + finalTranscript + interim;
                } else {
                    this.messageText = prefix + finalTranscript;
                }
            });
        };

        this.recognition.onerror = () => {
            this.zone.run(() => { this.isRecording = false; });
        };

        this.recognition.onend = () => {
            this.zone.run(() => { this.isRecording = false; });
        };

        this.recognition.start();
        this.isRecording = true;
    }

    private stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
            this.recognition = null;
        }
        this.isRecording = false;
    }
}
