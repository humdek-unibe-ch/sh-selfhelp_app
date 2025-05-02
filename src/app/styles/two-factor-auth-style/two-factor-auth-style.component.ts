import { Component, Input, OnInit, ViewChildren, QueryList, OnDestroy, AfterViewInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { FormBuilder } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { GlobalsService } from 'src/app/services/globals.service';
import { TwoFactorAuthStyle } from 'src/app/selfhelpInterfaces';
import { IonInput } from '@ionic/angular';

@Component({
    selector: 'app-two-factor-auth-style',
    templateUrl: './two-factor-auth-style.component.html',
    styleUrls: ['./two-factor-auth-style.component.scss'],
})
export class TwoFactorAuthStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() override style!: TwoFactorAuthStyle;

    // Default timer value in seconds (10 minutes)
    private readonly DEFAULT_TIMER_SECONDS: number = 600;

    // Public string representation for template binding
    code_remaining_time: string = this.DEFAULT_TIMER_SECONDS.toString();

    private timerInterval: any;
    private remainingSeconds: number = this.DEFAULT_TIMER_SECONDS;
    private formSubmissionInProgress: boolean = false;

    @ViewChildren('otpInput') otpInputs!: QueryList<IonInput>;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService, private globals: GlobalsService) {
        super();
    }

    override ngOnInit() {
        // Initialize the component
        this.startCountdownTimer();
    }

    ngAfterViewInit() {
        // Focus on the first input after view is initialized
        setTimeout(() => {
            if (this.otpInputs && this.otpInputs.first) {
                this.otpInputs.first.setFocus();
            }
        }, 300);
    }

    ngOnDestroy() {
        // Clear the timer when component is destroyed
        this.clearTimer();
    }

    /**
     * Starts the countdown timer for the 2FA code expiration
     */
    private startCountdownTimer(): void {
        // Initialize the timer with the value from code_remaining_time
        this.remainingSeconds = parseInt(this.code_remaining_time, 10);

        // Update the timer display immediately
        this.updateTimerDisplay();

        // Set up the interval to update every second
        this.timerInterval = setInterval(() => {
            this.remainingSeconds--;

            if (this.remainingSeconds <= 0) {
                // Timer expired
                this.clearTimer();
                // You might want to handle expiration (e.g., show message, disable inputs)
                this.handleTimerExpiration();
            } else {
                // Update the timer display
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    /**
     * Updates the timer display in the format MM:SS
     */
    private updateTimerDisplay(): void {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;

        // Format as MM:SS
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update the timer element
        const timerElement = document.getElementById('selfhelp-2fa-timer');
        if (timerElement) {
            timerElement.textContent = formattedTime;
        }

        // Also update the data attribute for any external scripts
        this.code_remaining_time = this.remainingSeconds.toString();
    }

    /**
     * Clears the timer interval
     */
    private clearTimer(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Handles timer expiration
     */
    private handleTimerExpiration(): void {
        // You can implement what happens when the timer expires
        // For example, show an error message or disable the form
        const form = document.getElementById('selfhelp-2fa-form') as HTMLFormElement;
        if (form) {
            // Disable all inputs
            this.otpInputs.forEach(input => {
                input.disabled = true;
            });

            this.selfhelpService.closeModal('cancel');

            // You might want to show an expiration message
            // This could be implemented by adding an alert to the UI
        }
    }

    /**
     * Focus handler for OTP input
     * Selects all text in the input when focused
     */
    onFocus(event: any): void {
        // IonInput doesn't have a direct select() method on the event target
        // Get the native input element and select its content
        if (event && event.target && event.target.getInputElement) {
            event.target.getInputElement().then((inputElement: HTMLInputElement) => {
                if (inputElement) {
                    inputElement.select();
                }
            });
        }
    }

    /**
     * Handle key press events for OTP input
     * Handles backspace functionality
     */
    onKeyUp(event: KeyboardEvent, currentIndex: number): void {
        const inputs = this.otpInputs.toArray();
        const input = event.target as HTMLInputElement;

        // Handle backspace key
        if (event.key === 'Backspace') {
            // Clear current input if it has a value
            if (input.value) {
                input.value = '';
                return;
            }

            // If current input is empty and not the first input, move to previous input
            if (currentIndex > 0) {
                const prevInput = inputs[currentIndex - 1];
                prevInput.setFocus();
            }
            return;
        }

        // NOTE: We don't handle jumping to next input here to avoid double jumps
        // The jumping is handled in the onInput method

        // Check if all inputs are filled for form submission
        this.checkFormCompletion();
    }

    /**
     * Handle paste events for OTP input
     * Distributes pasted digits across inputs
     */
    onPaste(event: ClipboardEvent, startIndex: number): void {
        event.preventDefault();

        const clipboardData = event.clipboardData;
        if (!clipboardData) return;

        const pastedText = clipboardData.getData('text').replace(/\D/g, ''); // Get only digits
        if (!pastedText) return;

        const inputs = this.otpInputs.toArray();
        const maxDigits = inputs.length - startIndex;
        const digitsToFill = pastedText.slice(0, maxDigits).split('');

        // Fill the inputs with pasted digits
        digitsToFill.forEach((digit, index) => {
            const inputIndex = startIndex + index;
            if (inputIndex < inputs.length) {
                inputs[inputIndex].value = digit;

                // Move focus to the next empty input or the last one
                if (index === digitsToFill.length - 1 && inputIndex < inputs.length - 1) {
                    inputs[inputIndex + 1].setFocus();
                }
            }
        });

        // If all inputs are filled, submit the form
        this.checkFormCompletion();
    }

    /**
     * Handle input events
     * Ensures only numeric input is allowed and handles jumping to next input
     */
    onInput(event: any, index: number): void {
        const input = event.target;
        const value = input.value.toString();

        // Ensure only one digit
        if (value.length > 1) {
            input.value = value.charAt(value.length - 1);
        }

        // Allow only digits
        input.value = input.value.replace(/\D/g, '');

        // Move to next input if available
        if (input.value && index < this.otpInputs.length - 1) {
            this.otpInputs.toArray()[index + 1].setFocus();
        }

        // Auto-submit when all fields are filled
        this.checkFormCompletion();
    }

    /**
     * Check if all inputs are filled and submit the form if they are
     */
    private async checkFormCompletion(): Promise<void> {
        // Prevent multiple executions
        if (this.formSubmissionInProgress) {
            return;
        }

        const allFilled = this.otpInputs.toArray().every(input => {
            const value = input.value?.toString() || '';
            return value.length === 1;
        });

        if (allFilled) {
            this.formSubmissionInProgress = true;
            const code = this.otpInputs.toArray().map(input => input.value).join('');

            let result = await this.selfhelpService.twoFactorAuth(code, this.getFieldContent('alert_fail'));
            if(!result){
                this.formSubmissionInProgress = false;
                // reset all inputs
                // focus on the first input
                this.otpInputs.toArray()[0].setFocus();
                this.otpInputs.toArray().forEach(input => {
                    input.value = '';
                });
            }
        }
    }
}
