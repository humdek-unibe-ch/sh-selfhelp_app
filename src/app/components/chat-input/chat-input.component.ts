import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    OnDestroy,
    OnInit,
    OnChanges,
    SimpleChanges,
    NgZone,
    ViewChild
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { SelfhelpService } from '../../services/selfhelp.service';

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
export class ChatInputComponent implements OnInit, OnDestroy, OnChanges {
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

    @Input() transcriptionUrl: string = '';
    @Input() sectionId: number | null = null;

    @Output() messageSend = new EventEmitter<string>();
    @Output() appendTextConsumed = new EventEmitter<void>();
    @Output() messageChange = new EventEmitter<string>();
    @Output() attachRequested = new EventEmitter<void>();
    @Output() filesSelected = new EventEmitter<File[]>();

    @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

    showTaggingPanel: boolean = false;

    messageText: string = '';
    isRecording: boolean = false;
    isTranscribing: boolean = false;
    speechError: string | null = null;
    isDragging: boolean = false;
    private recognition: any = null;
    private textBeforeRecording: string = '';

    private isNativePlatform: boolean = false;
    private nativeRecorderAvailable: boolean = false;
    private mediaRecorder: MediaRecorder | null = null;
    private audioStream: MediaStream | null = null;
    private audioChunks: Blob[] = [];
    private recordingTimeout: any = null;
    private readonly MAX_RECORDING_MS = 60000;

    mentionActive: MentionType = null;
    mentionQuery: string = '';
    mentionSuggestions: MentionSuggestion[] = [];
    mentionSelectedIndex: number = 0;
    private mentionTriggerPos: number = -1;

    constructor(private zone: NgZone, private selfhelpService: SelfhelpService) {
        this.isNativePlatform = Capacitor.isNativePlatform();
    }

    async ngOnInit() {
        if (this.isNativePlatform && this.speechToTextEnabled) {
            try {
                const status = await VoiceRecorder.canDeviceVoiceRecord();
                this.nativeRecorderAvailable = status.value;
                if (this.nativeRecorderAvailable) {
                    await VoiceRecorder.requestAudioRecordingPermission();
                }
            } catch {
                this.nativeRecorderAvailable = false;
            }
        }
    }

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
        this.cleanupMediaRecorder();
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
        if (!this.speechToTextEnabled) return false;
        if (this.isNativePlatform) {
            return (this.mediaRecorderAvailable || this.nativeRecorderAvailable) && !!this.transcriptionUrl;
        }
        return this.hasWebSpeechApi || this.hasMediaRecorderApi;
    }

    private get hasWebSpeechApi(): boolean {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    private get hasMediaRecorderApi(): boolean {
        return !!this.transcriptionUrl
            && typeof navigator !== 'undefined'
            && !!navigator.mediaDevices
            && typeof navigator.mediaDevices.getUserMedia === 'function';
    }

    private get useServerTranscription(): boolean {
        return !!this.transcriptionUrl && (this.isNativePlatform || !this.hasWebSpeechApi);
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

    dismissSpeechError() {
        this.speechError = null;
    }

    private get mediaRecorderAvailable(): boolean {
        return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    }

    private startRecording() {
        this.speechError = null;

        if (this.useServerTranscription) {
            // Prefer MediaRecorder on ALL platforms (low bitrate, small files)
            // Only fall back to native recorder if MediaRecorder unavailable
            if (this.mediaRecorderAvailable) {
                this.startMediaRecorderRecording();
            } else if (this.isNativePlatform && this.nativeRecorderAvailable) {
                this.startNativeRecording();
            } else {
                this.startMediaRecorderRecording();
            }
        } else {
            this.startWebSpeechRecording();
        }
    }

    private stopRecording() {
        if (this.mediaRecorder) {
            this.stopMediaRecorderRecording();
        } else if (this.isNativePlatform && this.useServerTranscription) {
            this.stopNativeRecording();
        } else {
            this.stopWebSpeechRecording();
        }
    }

    // ---- Native (capacitor-voice-recorder) ----

    private async startNativeRecording() {
        try {
            const perm = await VoiceRecorder.requestAudioRecordingPermission();
            if (!perm.value) {
                this.speechError = 'Microphone permission denied.';
                return;
            }
            this.textBeforeRecording = this.messageText;
            await VoiceRecorder.startRecording();
            this.isRecording = true;

            this.recordingTimeout = setTimeout(() => {
                if (this.isRecording) this.stopRecording();
            }, this.MAX_RECORDING_MS);
        } catch (e: any) {
            this.speechError = 'Failed to start recording: ' + (e.message || e);
            this.isRecording = false;
        }
    }

    private async stopNativeRecording() {
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
            this.recordingTimeout = null;
        }
        this.isRecording = false;

        try {
            const result = await VoiceRecorder.stopRecording();
            if (result?.value?.recordDataBase64) {
                const base64 = result.value.recordDataBase64;
                const byteChars = atob(base64);
                const byteArray = new Uint8Array(byteChars.length);
                for (let i = 0; i < byteChars.length; i++) {
                    byteArray[i] = byteChars.charCodeAt(i);
                }

                // Compress: decode AAC → downsample to 16kHz mono → WAV
                const compressed = await this.compressAudioToWav(byteArray.buffer);
                if (compressed) {
                    await this.sendAudioForTranscription(compressed, 'recording.wav');
                } else {
                    // Fallback: send original if compression fails
                    const rawMime = result.value.mimeType || 'audio/aac';
                    const mimeType = this.normalizeAudioMime(rawMime);
                    const ext = this.mimeToExtension(mimeType);
                    const blob = new Blob([byteArray], { type: mimeType });
                    await this.sendAudioForTranscription(blob, `recording.${ext}`);
                }
            }
        } catch (e: any) {
            this.speechError = 'Recording failed: ' + (e.message || e);
        }
    }

    private async compressAudioToWav(buffer: ArrayBuffer): Promise<Blob | null> {
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const decoded = await audioCtx.decodeAudioData(buffer.slice(0));

            const TARGET_RATE = 8000;
            const srcRate = decoded.sampleRate;
            const srcData = decoded.getChannelData(0); // mono

            // Downsample to 16kHz
            const ratio = srcRate / TARGET_RATE;
            const newLen = Math.floor(srcData.length / ratio);
            const samples = new Int16Array(newLen);
            for (let i = 0; i < newLen; i++) {
                const srcIdx = Math.floor(i * ratio);
                const val = Math.max(-1, Math.min(1, srcData[srcIdx]));
                samples[i] = val < 0 ? val * 0x8000 : val * 0x7FFF;
            }

            // Encode WAV
            const wavHeader = 44;
            const dataSize = samples.length * 2;
            const wavBuf = new ArrayBuffer(wavHeader + dataSize);
            const view = new DataView(wavBuf);

            const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
            writeStr(0, 'RIFF');
            view.setUint32(4, 36 + dataSize, true);
            writeStr(8, 'WAVE');
            writeStr(12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true); // PCM
            view.setUint16(22, 1, true); // mono
            view.setUint32(24, TARGET_RATE, true);
            view.setUint32(28, TARGET_RATE * 2, true);
            view.setUint16(32, 2, true);
            view.setUint16(34, 16, true);
            writeStr(36, 'data');
            view.setUint32(40, dataSize, true);

            const output = new Int16Array(wavBuf, wavHeader);
            output.set(samples);

            audioCtx.close();
            return new Blob([wavBuf], { type: 'audio/wav' });
        } catch (e) {
            console.error('Audio compression failed:', e);
            return null;
        }
    }

    // ---- MediaRecorder (browser fallback with server transcription) ----

    private async startMediaRecorderRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 }
            });
            this.audioStream = stream;
            this.audioChunks = [];
            this.textBeforeRecording = this.messageText;

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/webm')
                    ? 'audio/webm'
                    : 'audio/mp4';

            this.mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 16000 });

            this.mediaRecorder.ondataavailable = (ev) => {
                if (ev.data.size > 0) this.audioChunks.push(ev.data);
            };

            this.mediaRecorder.onstop = async () => {
                if (this.audioChunks.length > 0) {
                    const blob = new Blob(this.audioChunks, { type: mimeType });
                    await this.sendAudioForTranscription(blob, 'recording.webm');
                }
                this.audioChunks = [];
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            this.recordingTimeout = setTimeout(() => {
                if (this.isRecording) this.stopRecording();
            }, this.MAX_RECORDING_MS);
        } catch (e: any) {
            const msg = e.message || String(e);
            this.speechError = msg.includes('Permission denied') || msg.includes('NotAllowedError')
                ? 'Microphone access denied. Please allow microphone in your browser settings.'
                : 'Failed to start recording: ' + msg;
        }
    }

    private stopMediaRecorderRecording() {
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
            this.recordingTimeout = null;
        }
        this.isRecording = false;
        if (this.mediaRecorder?.state === 'recording') {
            this.mediaRecorder.stop();
        }
        this.cleanupMediaRecorder();
    }

    private cleanupMediaRecorder() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(t => t.stop());
            this.audioStream = null;
        }
    }

    // ---- Shared: send audio to server for transcription ----

    private async sendAudioForTranscription(blob: Blob, filename: string) {
        if (blob.size === 0) {
            this.speechError = 'No audio recorded.';
            return;
        }

        this.isTranscribing = true;
        this.speechError = null;

        try {
            const fd = new FormData();
            fd.append('audio', blob, filename);
            fd.append('action', 'speech_transcribe');
            fd.append('mobile', 'true');
            if (this.sectionId != null) {
                fd.append('section_id', String(this.sectionId));
            }

            const apiUrl = this.selfhelpService.getApiEndPointNative() + this.transcriptionUrl;
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: fd,
                credentials: 'include'
            });
            const result = await response.json();

            this.zone.run(() => {
                if (result.success && result.text) {
                    const trimmed = result.text.trim();
                    if (trimmed) {
                        const base = this.textBeforeRecording;
                        const separator = base && !base.match(/\s$/) ? ' ' : '';
                        this.setMessageText(base + separator + trimmed);
                    }
                } else if (result.success && !result.text) {
                    this.speechError = 'No speech detected. Please try again.';
                } else {
                    this.speechError = result.error || 'Speech transcription failed.';
                }
            });
        } catch (e: any) {
            this.zone.run(() => {
                this.speechError = 'Transcription failed: ' + (e.message || e);
            });
        } finally {
            this.zone.run(() => { this.isTranscribing = false; });
        }
    }

    // ---- Web Speech API (browser preview only) ----

    private startWebSpeechRecording() {
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

    private stopWebSpeechRecording() {
        this.isRecording = false;
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) {}
            this.recognition = null;
        }
    }

    private static readonly MIME_MAP: Record<string, string> = {
        'audio/aac': 'audio/mp4',
        'audio/x-aac': 'audio/mp4',
        'audio/m4a': 'audio/mp4',
        'audio/x-m4a': 'audio/mp4',
        'audio/3gpp': 'audio/mp4',
        'audio/amr': 'audio/mp4',
    };

    private static readonly EXT_MAP: Record<string, string> = {
        'audio/webm': 'webm',
        'audio/webm;codecs=opus': 'webm',
        'audio/wav': 'wav',
        'audio/mp3': 'mp3',
        'audio/mpeg': 'mp3',
        'audio/mp4': 'm4a',
        'audio/ogg': 'ogg',
        'audio/flac': 'flac',
    };

    private normalizeAudioMime(mime: string): string {
        const base = mime.split(';')[0].trim().toLowerCase();
        return ChatInputComponent.MIME_MAP[base] || base;
    }

    private mimeToExtension(mime: string): string {
        const base = mime.split(';')[0].trim().toLowerCase();
        return ChatInputComponent.EXT_MAP[base] || 'mp4';
    }

    private setMessageText(value: string): void {
        this.messageText = value;
        this.messageChange.emit(this.messageText);
    }
}
