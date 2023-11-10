import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResetPasswordResult, ResetPasswordStyle, ResetPasswordValues } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

interface FormControls {
    user_name: FormControl;
    reset_anonymous_user: FormControl;
    [key: string]: FormControl; // Add an index signature for dynamic properties
  }

@Component({
    selector: 'app-reset-password-style',
    templateUrl: './reset-password-style.component.html',
    styleUrls: ['./reset-password-style.component.scss'],
})
export class ResetPasswordStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ResetPasswordStyle;
    public form!: FormGroup;
    public reg_success = false;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        this.initForm();
    }

    private initForm(): void {
        if (this.style.anonymous_users) {
            let form_controls: FormControls = {
                user_name: new FormControl(this.style.reset_user_name, Validators.required),
                reset_anonymous_user: new FormControl(true, Validators.required),
            };
            this.style.security_questions_labels.forEach(question => {
                form_controls[question.id] = new FormControl('', Validators.required)
            });
            if (this.style.security_questions_labels.length > 0) {
                form_controls['reset_anonymous_user_sec_q'] = new FormControl(true, Validators.required);
            }
            this.form = this.formBuilder.group(form_controls);
        } else {
            this.form = this.formBuilder.group({
                email_user: new FormControl('', Validators.required)
            });
        }
    }

    public reset(value: ResetPasswordValues): void {
        this.selfhelpService.resetPassword(value)
            .then((res: ResetPasswordResult) => {
                if (res.result) {
                    if (this.style.anonymous_users) {
                        if (this.style.reset_user_name) {
                            // close it, we are on security questions check
                            this.selfhelpService.closeModal('submit');
                        } else {
                            // load the questions
                            this.selfhelpService.setPage(this.selfhelpService.API_RESET, res.selfhelp_res);
                        }
                        if (res.url) {
                            this.selfhelpService.openUrl(res.url as string);
                        }
                    } else {
                        this.selfhelpService.closeModal('submit');
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

}
