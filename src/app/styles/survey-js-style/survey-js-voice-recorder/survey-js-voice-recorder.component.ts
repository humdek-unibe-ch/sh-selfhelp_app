import { Component, Input, OnInit } from '@angular/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

@Component({
    selector: 'app-survey-js-voice-recorder',
    templateUrl: './survey-js-voice-recorder.component.html',
    styleUrls: ['./survey-js-voice-recorder.component.scss'],
})
export class SurveyJsVoiceRecorderComponent implements OnInit {
    @Input() question: any;  // Add this line to accept the question object
    isRecording = false;
    recording: string | null = null;

    constructor() { }

    ngOnInit() {
        VoiceRecorder.requestAudioRecordingPermission().then((res) => {
            console.log(res);
        });
    }

    async startRecording() {
        try {
            this.question.recordingStartedAt = undefined;
            this.question.recordingEndedAt = undefined;
            this.question.recordingDuration = undefined;
            // erase previous data
            this.question.value = undefined;
            const permission = await VoiceRecorder.requestAudioRecordingPermission();
            console.log('start', permission);
            if (permission && permission.value) { // Adjusting the type checking
                this.isRecording = true;
                this.question.recordingStartedAt = new Date();
                await VoiceRecorder.startRecording();
            }
        } catch (error) {
            console.error('Error starting recording', error);
        }
    }

    async stopRecording() {
        try {
            const result = await VoiceRecorder.stopRecording();
            console.log(result);
            if (result && result.value && result.value.recordDataBase64) {
                const base64Sound = result.value.recordDataBase64;
                this.recording = `data:audio/webm;base64,${base64Sound}`;
            }
            this.isRecording = false; // Ensure the UI updates immediately
            let eD = new Date();
            this.question.value = this.recording;  // Set the question value to the recording URL
            this.question.recordingEndedAt = eD;
            if (this.question.recordingStartedAt instanceof Date) {
                this.question.recordingDuration = eD.getTime() - this.question.recordingStartedAt.getTime();
            } else {
                console.error('recordingStartedAt is not a Date object');
            }
        } catch (error) {
            console.error('Error stopping recording', error);
            this.isRecording = false; // Ensure the UI updates even if there's an error
        }
    }
}
