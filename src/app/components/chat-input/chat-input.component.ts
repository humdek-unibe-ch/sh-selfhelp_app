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
import { Filesystem } from '@capacitor/filesystem';
import { CapacitorAudioRecorder } from '@capgo/capacitor-audio-recorder';
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
type MicAudioConstraint = true | MediaTrackConstraints;

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
    private textBeforeRecording: string = '';

    private mediaRecorder: MediaRecorder | null = null;
    private recordingMode: 'media' | 'native' | null = null;
    private audioStream: MediaStream | null = null;
    private audioChunks: Blob[] = [];
    private recordingMimeType: string = 'audio/webm';
    private nativeRecordingMimeType: string = 'audio/aac';
    private recordingTimeout: any = null;
    private readonly MAX_RECORDING_MS = 60000;
    private readonly MAX_NATIVE_RECORDING_MS = 12000;
    private readonly MAX_NATIVE_AUDIO_BYTES = 32 * 1024;
    private isNativePlatform: boolean = false;
    private nativeRecorderAvailable: boolean = false;

    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private silenceTimer: any = null;
    private silenceStart: number = 0;
    private hasSpoken: boolean = false;
    private readonly SILENCE_THRESHOLD = 0.01;
    private readonly SILENCE_DURATION_MS = 2000;
    private readonly SILENCE_CHECK_MS = 150;
    private readonly MIC_AUDIO_CONSTRAINT_FALLBACKS: MicAudioConstraint[] = [
        {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: { ideal: 1 },
            sampleRate: { ideal: 24000 },
        },
        {
            echoCancellation: true,
            noiseSuppression: true,
        },
        true,
    ];

    mentionActive: MentionType = null;
    mentionQuery: string = '';
    mentionSuggestions: MentionSuggestion[] = [];
    mentionSelectedIndex: number = 0;
    private mentionTriggerPos: number = -1;

    constructor(private zone: NgZone, private selfhelpService: SelfhelpService) {
        this.isNativePlatform = Capacitor.isNativePlatform();
    }

    async ngOnInit() {
        if (!this.isNativePlatform || !this.speechToTextEnabled) {
            return;
        }

        try {
            await CapacitorAudioRecorder.getRecordingStatus();
            this.nativeRecorderAvailable = true;
        } catch {
            this.nativeRecorderAvailable = false;
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
        return this.hasMediaRecorderApi || (this.isNativePlatform && this.nativeRecorderAvailable);
    }

    private get hasMediaRecorderApi(): boolean {
        return typeof MediaRecorder !== 'undefined'
            && typeof navigator !== 'undefined'
            && !!navigator.mediaDevices
            && typeof navigator.mediaDevices.getUserMedia === 'function';
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
        return this.hasMediaRecorderApi || (this.isNativePlatform && this.nativeRecorderAvailable);
    }

    private startRecording() {
        if (!this.mediaRecorderAvailable) {
            this.speechError = 'Speech transcription is unavailable on this device.';
            return;
        }

        this.speechError = null;
        if (this.hasMediaRecorderApi) {
            this.startMediaRecorderRecording();
            return;
        }

        this.startNativeRecording();
    }

    private stopRecording() {
        if (this.recordingMode === 'native') {
            this.stopNativeRecording();
            return;
        }
        this.stopMediaRecorderRecording();
    }

    private async startMediaRecorderRecording() {
        if (this.isRecording) {
            return;
        }

        try {
            const mimeType = this.getPreferredAudioMimeType();
            if (!mimeType) {
                this.speechError = 'No supported compressed audio format available.';
                return;
            }

            const stream = await this.requestMicrophoneStream();
            this.audioStream = stream;
            this.audioChunks = [];
            this.textBeforeRecording = this.messageText;
            this.recordingMimeType = mimeType;

            this.mediaRecorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 16000 });

            this.mediaRecorder.ondataavailable = (ev) => {
                if (ev.data.size > 0) this.audioChunks.push(ev.data);
            };

            this.mediaRecorder.onstop = async () => {
                if (this.audioChunks.length > 0) {
                    const blob = new Blob(this.audioChunks, { type: this.recordingMimeType });
                    const filename = `recording.${this.mimeToExtension(this.recordingMimeType)}`;
                    await this.sendAudioForTranscription(blob, filename);
                }
                this.audioChunks = [];
            };

            this.mediaRecorder.start(250);
            this.recordingMode = 'media';
            this.isRecording = true;

            this.startSilenceDetection(stream);

            this.recordingTimeout = setTimeout(() => {
                if (this.isRecording) this.stopRecording();
            }, this.MAX_RECORDING_MS);
        } catch (e: any) {
            const msg = e.message || String(e);
            this.speechError = msg.includes('Permission denied') || msg.includes('NotAllowedError')
                ? 'Microphone access denied. Please allow microphone in your browser settings.'
                : msg.includes('OverconstrainedError')
                    ? 'Microphone constraints not supported on this device. Retrying with safe defaults failed.'
                : 'Failed to start recording: ' + msg;
        }
    }

    private async requestMicrophoneStream(): Promise<MediaStream> {
        let lastError: any = null;

        for (const audio of this.MIC_AUDIO_CONSTRAINT_FALLBACKS) {
            try {
                return await navigator.mediaDevices.getUserMedia({ audio });
            } catch (err: any) {
                lastError = err;
                const name = err?.name || '';
                if (name !== 'OverconstrainedError' && name !== 'NotFoundError') {
                    throw err;
                }
            }
        }

        throw lastError || new Error('No supported microphone constraints');
    }

    private stopMediaRecorderRecording() {
        if (!this.mediaRecorder && !this.isRecording) {
            return;
        }

        this.stopSilenceDetection();
        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
            this.recordingTimeout = null;
        }

        this.isRecording = false;
        this.recordingMode = null;

        const recorder = this.mediaRecorder;
        this.mediaRecorder = null;

        if (recorder?.state === 'recording') {
            recorder.stop();
        }

        this.cleanupMediaRecorder();
    }

    private async startNativeRecording() {
        if (this.isRecording) {
            return;
        }

        try {
            const permission = await CapacitorAudioRecorder.requestPermissions();
            if (permission?.recordAudio !== 'granted') {
                this.speechError = 'Microphone access denied. Please allow microphone in your device settings.';
                return;
            }

            this.textBeforeRecording = this.messageText;
            this.recordingMode = 'native';
            this.isRecording = true;
            await CapacitorAudioRecorder.startRecording({
                sampleRate: 16000,
                bitRate: 16000
            });

            this.recordingTimeout = setTimeout(() => {
                if (this.isRecording) this.stopRecording();
            }, this.MAX_NATIVE_RECORDING_MS);
        } catch (e: any) {
            this.isRecording = false;
            this.recordingMode = null;
            this.speechError = 'Failed to start recording: ' + (e?.message || e);
        }
    }

    private async stopNativeRecording() {
        if (!this.isRecording && this.recordingMode !== 'native') {
            return;
        }

        if (this.recordingTimeout) {
            clearTimeout(this.recordingTimeout);
            this.recordingTimeout = null;
        }

        this.isRecording = false;
        this.recordingMode = null;

        try {
            const result = await CapacitorAudioRecorder.stopRecording();
            const blob = await this.resolveNativeAudioBlob(result);
            if (!blob) {
                this.speechError = 'No audio recorded.';
                return;
            }

            if (blob.size > this.MAX_NATIVE_AUDIO_BYTES) {
                this.speechError = 'Recording too large for speech service. Please record a shorter message.';
                return;
            }
            const filename = this.getNativeRecordingFilename(result?.uri, blob.type);
            await this.sendAudioForTranscription(blob, filename);
        } catch (e: any) {
            this.speechError = 'Failed to stop recording: ' + (e?.message || e);
        }
    }

    private cleanupMediaRecorder() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(t => t.stop());
            this.audioStream = null;
        }
    }

    private getPreferredAudioMimeType(): string {
        const preferredMimeTypes = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4'
        ];

        for (const mime of preferredMimeTypes) {
            if (MediaRecorder.isTypeSupported(mime)) {
                return mime;
            }
        }

        return '';
    }

    private static readonly EXT_MAP: Record<string, string> = {
        'audio/webm': 'webm',
        'audio/webm;codecs=opus': 'webm',
        'audio/ogg': 'ogg',
        'audio/ogg;codecs=opus': 'ogg',
        'audio/mp4': 'm4a',
        'audio/m4a': 'm4a',
        'audio/aac': 'm4a',
        'audio/x-aac': 'm4a',
        'audio/x-hx-aac-adts': 'm4a',
    };

    private mimeToExtension(mime: string): string {
        const base = mime.split(';')[0].trim().toLowerCase();
        return ChatInputComponent.EXT_MAP[base] || 'webm';
    }

    private base64ToBlob(base64Data: string, mimeType: string): Blob {
        const byteChars = atob(base64Data);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
            byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    private async resolveNativeAudioBlob(result: any): Promise<Blob | null> {
        if (result?.blob instanceof Blob) {
            return result.blob;
        }

        const uri = result?.uri as string | undefined;
        if (!uri) {
            return null;
        }

        const directBlob = await this.fetchBlobFromUri(uri);
        if (directBlob) {
            return directBlob;
        }

        const webviewUri = Capacitor.convertFileSrc(uri);
        if (webviewUri && webviewUri !== uri) {
            const webviewBlob = await this.fetchBlobFromUri(webviewUri);
            if (webviewBlob) {
                return webviewBlob;
            }
        }

        try {
            const read = await Filesystem.readFile({ path: uri });
            if (typeof read.data === 'string' && read.data.length > 0) {
                return this.base64ToBlob(read.data, this.nativeRecordingMimeType);
            }
        } catch {
            // Ignore and return null below.
        }

        return null;
    }

    private async fetchBlobFromUri(uri: string): Promise<Blob | null> {
        try {
            const response = await fetch(uri);
            if (!response.ok) {
                return null;
            }
            return await response.blob();
        } catch {
            return null;
        }
    }

    private getNativeRecordingFilename(uri?: string, blobMimeType?: string): string {
        const uriWithoutQuery = (uri || '').split('?')[0];
        const extFromUri = uriWithoutQuery.includes('.')
            ? uriWithoutQuery.substring(uriWithoutQuery.lastIndexOf('.') + 1).toLowerCase()
            : '';

        const safeExt = extFromUri || this.mimeToExtension(blobMimeType || this.nativeRecordingMimeType);
        return `recording.${safeExt}`;
    }

    private startSilenceDetection(stream: MediaStream) {
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);

            this.audioContext = ctx;
            this.analyser = analyser;
            this.silenceStart = 0;
            this.hasSpoken = false;

            const dataArray = new Float32Array(analyser.fftSize);

            this.silenceTimer = setInterval(() => {
                if (!this.analyser) return;
                this.analyser.getFloatTimeDomainData(dataArray);

                let rms = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    rms += dataArray[i] * dataArray[i];
                }
                rms = Math.sqrt(rms / dataArray.length);

                if (rms > this.SILENCE_THRESHOLD) {
                    this.hasSpoken = true;
                    this.silenceStart = 0;
                } else if (this.hasSpoken) {
                    if (this.silenceStart === 0) {
                        this.silenceStart = Date.now();
                    } else if (Date.now() - this.silenceStart >= this.SILENCE_DURATION_MS) {
                        this.zone.run(() => this.stopRecording());
                    }
                }
            }, this.SILENCE_CHECK_MS);
        } catch {
            // Silence detection not available — user stops manually.
        }
    }

    private stopSilenceDetection() {
        if (this.silenceTimer) {
            clearInterval(this.silenceTimer);
            this.silenceTimer = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
            this.analyser = null;
        }
    }

    // ---- Shared: send audio to server for transcription ----

    private async sendAudioForTranscription(blob: Blob, filename: string) {
        if (blob.size === 0) {
            this.speechError = 'No audio recorded.';
            return;
        }

        const transcriptionPath = this.resolveTranscriptionPath();
        if (!transcriptionPath) {
            this.speechError = 'Speech transcription endpoint is not configured.';
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

            const apiUrl = this.selfhelpService.getApiEndPointNative() + transcriptionPath;
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

    private resolveTranscriptionPath(): string {
        const explicit = (this.transcriptionUrl || '').trim();
        if (explicit) {
            return explicit.startsWith('/') ? explicit : '/' + explicit;
        }

        const currentUrl = (this.selfhelpService.selfhelp.value.current_url || '').trim();
        if (!currentUrl) {
            return '';
        }

        if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
            try {
                return new URL(currentUrl).pathname || '';
            } catch {
                return '';
            }
        }

        return currentUrl.startsWith('/') ? currentUrl : '/' + currentUrl;
    }

    private setMessageText(value: string): void {
        this.messageText = value;
        this.messageChange.emit(this.messageText);
    }
}
