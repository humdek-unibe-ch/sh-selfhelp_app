import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { RegisterStyle, RegistrationResult, RegistrationValues } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-register-style',
    templateUrl: './register-style.component.html',
    styleUrls: ['./register-style.component.scss'],
})
export class RegisterStyleComponen extends BasicStyleComponent implements OnInit {
    @Input() style: RegisterStyle;
    public form: FormGroup;
    public reg_success = false;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        console.log(this.style); 
        this.initForm();
    }

    // Define the custom validator function
    differentQuestionsValidator(control: AbstractControl): { [key: string]: boolean } | null {
        const question1Value = control.get('security_question_1')?.value;
        const question2Value = control.get('security_question_2')?.value;

        // Check if both question values are defined and equal
        if (question1Value && question2Value && question1Value === question2Value) {
            return { differentQuestions: true };
        }

        return null;
    }

    private initForm(): void {
        if (this.style.anonymous_users) {
            this.form = this.formBuilder.group({
                code: new FormControl('', Validators.required),
                security_question_1: new FormControl('', Validators.required),
                security_question_1_answer: new FormControl('', Validators.required),
                security_question_2: new FormControl('', Validators.required),
                security_question_2_answer: new FormControl('', Validators.required),
            }, { validator: this.differentQuestionsValidator });
        } else {
            if (this.getFieldContent('open_registration') == '1') {
                this.form = this.formBuilder.group({
                    email: new FormControl('', Validators.required)
                });
            } else {
                this.form = this.formBuilder.group({
                    email: new FormControl('', Validators.required),
                    code: new FormControl('', Validators.required)
                });
            }
        }
    }

    public register(value: RegistrationValues): void {
        this.selfhelpService.register(value)
            .then((res: RegistrationResult) => {
                if (res.result) {
                    this.reg_success = true;
                    this.selfhelpService.closeModal();
                    if (res.url) {
                        this.selfhelpService.openUrl(res.url as string);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

}
