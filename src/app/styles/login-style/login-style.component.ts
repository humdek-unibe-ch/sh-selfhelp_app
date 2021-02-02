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
    @Input() style: LoginStyle;
    public form: FormGroup;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
            email: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required)
        });
    }

    public login(value: LoginValues): void {
        this.selfhelpService.login(value, this.getFieldContent('alert_fail'))
            .then((res: boolean) => {
                if (res) {
                    this.selfhelpService.closeModal();
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
        this.selfhelpService.openUrl('/reset');
    }

}
