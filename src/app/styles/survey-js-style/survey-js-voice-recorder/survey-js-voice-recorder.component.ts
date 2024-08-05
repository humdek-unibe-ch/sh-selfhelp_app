import { Component, Input, OnInit } from '@angular/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';

@Component({
    selector: 'app-survey-js-voice-recorder',
    templateUrl: './survey-js-voice-recorder.component.html',
    styleUrls: ['./survey-js-voice-recorder.component.scss'],
})
export class SurveyJsVoiceRecorderComponent implements OnInit {
    @Input() question: any;  // Add this line to accept the question object
    @Input() disabled: boolean = false;
    isRecording = false;
    recording: string | null = null;

    constructor() { }

    ngOnInit() {
        VoiceRecorder.requestAudioRecordingPermission().then((res) => { });
    }

    /**
     * @brief Starts the recording process.
     *
     * This function requests audio recording permission, and if granted, starts recording audio.
     * It also resets any previous recording data stored in the `question` object.
     *
     * @returns {Promise<void>} A promise that resolves when the recording starts.
     * @throws {Error} Logs an error message if there is an issue starting the recording.
     */
    async startRecording() {
        try {
            this.question.recordingStartedAt = undefined;
            this.question.recordingEndedAt = undefined;
            this.question.recordingDuration = undefined;
            // erase previous data
            this.question.value = undefined;
            const permission = await VoiceRecorder.requestAudioRecordingPermission();
            if (permission && permission.value) { // Adjusting the type checking
                this.isRecording = true;
                this.question.recordingStartedAt = new Date();
                await VoiceRecorder.startRecording();
            }
        } catch (error) {
            console.error('Error starting recording', error);
        }
    }

    /**
     * @brief Stops the recording process.
     *
     * This function stops the audio recording and processes the recorded audio.
     * It sets the recording data to the `question` object and updates the UI accordingly.
     *
     * @returns {Promise<void>} A promise that resolves when the recording stops.
     * @throws {Error} Logs an error message if there is an issue stopping the recording.
     */
    async stopRecording() {
        try {
            const result = await VoiceRecorder.stopRecording();
            if (result && result.value && result.value.recordDataBase64) {
                const base64Sound = result.value.recordDataBase64;
                this.recording = `data:audio/aac;base64,${base64Sound}`;
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

    /**
     * @description Delete recording and remove the audio from the question
     * @author Stefan Kodzhabashev
     * @date 02/08/2024
     * @memberof SurveyJsVoiceRecorderComponent
     */
    deleteRecording() {
        this.recording = null;
        this.question.value = null;
    }
}
