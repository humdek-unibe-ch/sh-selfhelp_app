import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { MustMatch } from 'src/app/_helpers/must-match.validator';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { InputStyle, SelectStyle, ValidateStyle, ValidateValues, ValidationResult } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-validate-style',
    templateUrl: './validate-style.component.html',
    styleUrls: ['./validate-style.component.scss'],
})
export class ValidateStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: ValidateStyle;
    public form: FormGroup;
    private extraFormFields = {};
    inputStyles = [];

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    private initForm(): void {
        this.collectFormFields(this.style);
        let def_gender = parseInt(this.getFieldContent('value_gender'));
        let defaultValidationFields = {
            name: new FormControl(this.style.anonymous_users ? this.style.user_name : '', Validators.required),
            pw: new FormControl('', [Validators.required, Validators.minLength(8)]),
            pw_verify: new FormControl('', Validators.required),
            gender: new FormControl(def_gender, Validators.required),
        };
        let mergedFields = Object.assign({}, defaultValidationFields, this.extraFormFields);
        this.form = this.formBuilder.group(mergedFields, {
            validator: MustMatch('pw', 'pw_verify')
        });
    }

    private collectFormFields(style: any) {
        style.children.forEach(formField => {
            if (formField['children'] && formField['children'].length > 0) {
                this.collectFormFields(formField);
            }
            else if (this.selfhelpService.isFormField(formField)) {
                const input = this.selfhelpService.getFormField(formField);
                let value: any = input.value ? input.value.content : ''; // if there is a default value we assign it
                if (this.getFieldContent('is_log') != '1' && input.last_value) {
                    value = input.last_value; // the form is not a log, get the last value
                }
                if (input.style_name == 'input' && (<InputStyle>input).type_input.content == 'checkbox') {
                    // assign values to true/false for checkbox. Ionic need them as boolean
                    value = value != '';
                }
                if (input.style_name == 'select' && (<SelectStyle>input).disabled.content == '1') {
                    // if select is disabled
                    value = value == 1;
                    value = { value: value, disabled: true };
                }
                const req = input.is_required.content == '1' ? Validators.required : null;
                this.inputStyles.push(formField);
                this.extraFormFields[input.name.content.toString()] = new FormControl(value, req);
            }
        });
    }

    validate(value: ValidateValues) {
        this.selfhelpService.validate(value, this.url)
            .then((res: ValidationResult) => {
                if (res.result) {
                    this.selfhelpService.closeModal();
                    if (res.url) {
                        this.selfhelpService.openUrl(res.url as string);
                    } else {
                        this.selfhelpService.openUrl(this.selfhelpService.API_LOGIN);
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }
}
