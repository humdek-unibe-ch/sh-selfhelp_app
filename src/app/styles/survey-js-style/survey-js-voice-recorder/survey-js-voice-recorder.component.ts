import { Component, OnInit } from '@angular/core';
import { VoiceRecorder, VoiceRecorderPlugin, RecordingData, GenericResponse, CurrentRecordingStatus } from 'capacitor-voice-recorder';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-survey-js-voice-recorder',
    templateUrl: './survey-js-voice-recorder.component.html',
    styleUrls: ['./survey-js-voice-recorder.component.scss'],
})
export class SurveyJsVoiceRecorderComponent implements OnInit {
    isRecording: boolean = false;
    recordings: string[] = [];
    mediaRecorder: MediaRecorder | null = null;
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
            this.mediaRecorder.ondataavailable = (event) => {
                this.chunks.push(event.data);
            };
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, { type: 'audio/wav' });
                this.chunks = [];
                const audioURL = window.URL.createObjectURL(blob);
                this.recordings.push(audioURL);
            };
        } catch (err) {
            console.error('Error accessing microphone', err);
        }
    }

    async startRecording() {
        this.isRecording = true;
        await VoiceRecorder.startRecording();
    }

    async stopRecording() {
        const result = await VoiceRecorder.stopRecording();
        this.isRecording = false;

        if (result.value && result.value.recordDataBase64) {
            const audioUrl = 'data:audio/aac;base64,' + result.value.recordDataBase64;
            this.recordings.push(audioUrl);
        }
    }

}
