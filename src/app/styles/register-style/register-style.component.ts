import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterStyle, RegistrationValues } from 'src/app/selfhelpInterfaces';
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
        this.initForm();
    }

    private initForm(): void {
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

    public register(value: RegistrationValues): void {
        this.selfhelpService.register(value)
            .then((res: boolean) => {
                if (res) {
                    // this.selfhelpService.closeModal();
                    this.reg_success = true;
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

}
