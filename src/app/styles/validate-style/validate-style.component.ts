import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ValidateStyle, ValidateValues } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-validate-style',
    templateUrl: './validate-style.component.html',
    styleUrls: ['./validate-style.component.scss'],
})
export class ValidateStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: ValidateStyle;
    public form: FormGroup;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    private initForm(): void {
        this.form = this.formBuilder.group({
            name: new FormControl('', Validators.required),
            pw: new FormControl('', [Validators.required, Validators.minLength(8)]),
            pw_verify: new FormControl('', Validators.required),
            gender: new FormControl(1, Validators.required),
        }, {
            validator: MustMatch('pw', 'pw_verify')
        });
    }

    validate(value: ValidateValues) {
        this.selfhelpService.validate(value, this.url)
            .then((res: boolean) => {
                if (res) {
                    this.selfhelpService.closeModal();
                    this.selfhelpService.openUrl(this.selfhelpService.API_LOGIN);
                }
            })
            .catch((err) => {
                console.log(err); 
            });
    }
}
