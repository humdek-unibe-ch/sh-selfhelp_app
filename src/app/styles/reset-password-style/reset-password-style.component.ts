import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ResetPasswordStyle, ResetPasswordValues } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
  selector: 'app-reset-password-style',
  templateUrl: './reset-password-style.component.html',
  styleUrls: ['./reset-password-style.component.scss'],
})
export class ResetPasswordStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: ResetPasswordStyle;
    public form: FormGroup;
    public reg_success = false;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
                email_user: new FormControl('', Validators.required)
            });
    }

    public reset(value:ResetPasswordValues): void {
        this.selfhelpService.resetPassword(value)
            .then((res: boolean) => {
                if(res){
                    this.selfhelpService.closeModal();
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

}
