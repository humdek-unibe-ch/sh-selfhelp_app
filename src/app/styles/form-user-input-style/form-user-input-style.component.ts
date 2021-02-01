import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { FormUserInputStyle, InputStyle, RadioStyle, SelectStyle, TextAreaStyle } from './../../selfhelpInterfaces';
import { BasicStyleComponent } from './../basic-style/basic-style.component';

@Component({
    selector: 'app-form-user-input-style',
    templateUrl: './form-user-input-style.component.html',
    styleUrls: ['./form-user-input-style.component.scss'],
})
export class FormUserInputStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: FormUserInputStyle;
    public form: FormGroup;

    constructor(protected formBuilder: FormBuilder, protected selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        this.initForm();
    }

    protected initForm(): void {
        let formFields = {};
        this.style.children.forEach(formField => {
            if (this.isFormField(formField)) {
                const input = this.getFormField(formField);
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
                formFields[input.name.content.toString()] = new FormControl(value, req);
            }
        });
        this.form = this.formBuilder.group(formFields);
        this.form.valueChanges.subscribe(x => {
            console.log('form value changed')
            console.log(x)
        })
    }

    protected prepareParams(value: { [key: string]: any; }): any {
        let params = {};
        params['__form_name'] = this.getFieldContent('name');
        this.style.children.forEach(formField => {
            if (this.isFormField(formField)) {
                const input = this.getFormField(formField);
                let fieldValue = value[input.name.content.toString()];
                if (input.style_name == 'input' && (<InputStyle>input).type_input.content == 'checkbox') {
                    // assign values to true/false for checkbox. Ionic need them as boolean
                    fieldValue = fieldValue ? this.getChildFieldDefault(formField, 'value') : null;
                    console.log(fieldValue);
                }
                params[input.name.content.toString()] = {
                    id: input.id.content,
                    value: fieldValue
                }
            }
        });
        return params;
    }

    protected getFormField(formField: any): InputStyle | RadioStyle | SelectStyle | TextAreaStyle {
        switch (formField.style_name) {
            case 'input':
                return <InputStyle>formField;
            case 'radio':
                return <RadioStyle>formField;
            case 'select':
                return <SelectStyle>formField;
            case 'textarea':
                return <TextAreaStyle>formField;
            default:
                return formField;
        }
    }

    protected isFormField(field: any): boolean {
        return field.style_name &&
            (field.style_name == 'input' || field.style_name == 'radio' || field.style_name == 'select' || field.style_name == 'textarea');
    }

    public submitForm(value: { [key: string]: any; }): void {
        this.selfhelpService.submitForm(this.url, this.prepareParams(value));
    }

    public submitFormAndSendEmail(value: { [key: string]: any; }): void {
        let params = this.prepareParams(value);
        params['btnSubmitAndSend'] = 'send_email';
        this.selfhelpService.submitForm(this.url, params);
    }

}
