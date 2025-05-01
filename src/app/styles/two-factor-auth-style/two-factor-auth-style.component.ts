import { Component, Input, OnInit, ViewChildren, QueryList } from '@angular/core';
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
export class TwoFactorAuthStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: TwoFactorAuthStyle;
    code_remaining_time: string = '600'; // Default 10 minutes in seconds
    
    @ViewChildren('otpInput') otpInputs!: QueryList<IonInput>;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService, private globals: GlobalsService) {
        super();
    }

    override ngOnInit() {
        // Initialize the component
    }

    /**
     * Focus handler for OTP input
     * Selects all text in the input when focused
     */
    onFocus(event: any): void {
        event.target.select();
    }

    /**
     * Handle key press events for OTP input
     * Moves focus to next input when a digit is entered
     */
    onKeyUp(event: KeyboardEvent, currentIndex: number): void {
        const inputs = this.otpInputs.toArray();
        
        // If backspace, move to previous input
        if (event.key === 'Backspace' && currentIndex > 0) {
            inputs[currentIndex - 1].setFocus();
            return;
        }
        
        // If a number is entered, move to next input
        if (/^[0-9]$/.test(event.key) && currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].setFocus();
        }
        
        // If all inputs are filled, submit the form
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
     * Ensures only numeric input is allowed
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
    private checkFormCompletion(): void {
        const allFilled = this.otpInputs.toArray().every(input => {
            const value = input.value?.toString() || '';
            return value.length === 1;
        });
        
        if (allFilled) {
            setTimeout(() => {
                const form = document.getElementById('selfhelp-2fa-form') as HTMLFormElement;
                if (form) form.submit();
            }, 300); // Small delay to allow UI to update
        }
    }
}
