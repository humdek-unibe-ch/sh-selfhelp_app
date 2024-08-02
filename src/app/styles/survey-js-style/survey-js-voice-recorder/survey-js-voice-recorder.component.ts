import { Component, Input, OnInit } from '@angular/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-survey-js-voice-recorder',
    templateUrl: './survey-js-voice-recorder.component.html',
    styleUrls: ['./survey-js-voice-recorder.component.scss'],
})
export class SurveyJsVoiceRecorderComponent implements OnInit {
    @Input() question: any;  // Add this line to accept the question object
    isRecording = false;
    recording: string | null = null;
    mediaRecorder: any;
    chunks: any[] = [];

    constructor(private selfhelp: SelfhelpService) { }

    ngOnInit() {
        console.log('Audio permissions');
        VoiceRecorder.requestAudioRecordingPermission().then((res) => {
            console.log(res);
        });

        if (!this.selfhelp.getIsApp()) {
            this.requestAudioRecordingPermission();
        }
    }

    async requestAudioRecordingPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone permission granted');
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (event: any) => {
                this.chunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                const blob = new Blob(this.chunks, { type: 'audio/wav' });
                this.chunks = [];
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    this.recording = base64data; // Overwrite the previous recording
                    this.question.value = this.recording;  // Set the question value to the recording Base64
                    this.isRecording = false; // Ensure the UI updates immediately
                };
            };
        } catch (err) {
            console.error('Error accessing microphone', err);
        }
    }

    async startRecording() {
        try {
            const permission = await VoiceRecorder.requestAudioRecordingPermission();
            console.log(permission);
            if (permission && permission.value) { // Adjusting the type checking
                this.isRecording = true;
                if (!this.selfhelp.getIsApp()) {
                    this.mediaRecorder.start();
                } else {
                    await VoiceRecorder.startRecording();
                }
            }
        } catch (error) {
            console.error('Error starting recording', error);
        }
    }

    async stopRecording() {
        try {
            if (!this.selfhelp.getIsApp()) {
                this.mediaRecorder.stop();
            } else {
                const result = await VoiceRecorder.stopRecording();
                console.log(result);
                if (result && result.value && result.value.recordDataBase64) {
                    console.log(result);
                    const base64Sound = result.value.recordDataBase64;
                    this.recording = `data:audio/aac;base64,${base64Sound}`;
                }
            }
            this.isRecording = false; // Ensure the UI updates immediately
            this.question.value = this.recording;  // Set the question value to the recording URL
            console.log(this.recording);
        } catch (error) {
            console.error('Error stopping recording', error);
            this.isRecording = false; // Ensure the UI updates even if there's an error
        }
    }
}
