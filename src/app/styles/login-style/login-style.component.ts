import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { LoginStyle, LoginValues } from './../../selfhelpInterfaces';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-login-style',
    templateUrl: './login-style.component.html',
    styleUrls: ['./login-style.component.scss'],
})
export class LoginStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: LoginStyle;
    public form!: FormGroup;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        this.initForm();
    }

    private initForm(): void {
        if (this.style.anonymous_users) {
            this.form = this.formBuilder.group({
                user_name: new FormControl('', Validators.required),
                password: new FormControl('', Validators.required)
            });

        } else {
            this.form = this.formBuilder.group({
                email: new FormControl('', Validators.required),
                password: new FormControl('', Validators.required)
            });
        }
    }

    public login(value: LoginValues): void {
        this.selfhelpService.login(value, this.getFieldContent('alert_fail'))
            .then((res: boolean | '2fa') => {
                if (res) {
                    this.selfhelpService.closeModal('submit');
                    if(res == '2fa'){
                        this.selfhelpService.openTwoFactorAuth();
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    public forgottenPassword() {
        // const value: LoginValues = {
        //     email: '',
        //     password: ''
        // }
        // this.selfhelpService.login(value, null);
        // this.selfhelpService.getPage('/');
        // this.selfhelpService.closeModal();
        this.selfhelpService.closeModal('cancel');
        this.selfhelpService.openUrl('/reset');
    }

    public outputResetPassword() {
        return Boolean(!this.style.anonymous_users) || Boolean(this.style.is_reset_password_enabled);
    }

}
