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
    @Input() override style!: FormUserInputStyle;
    public form!: FormGroup;
    private formFields: { [key: string]: any } = {};
    inputStyles: any[] = [];

    constructor(protected formBuilder: FormBuilder, protected selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        this.initForm();
        console.log('css',this.getCss());
    }

    private collectFormFields(style: any) {
        style.children.forEach((formField: any) => {
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
                const req = input['is_required'] && input.is_required.content == '1' ? Validators.required : null;
                this.inputStyles.push(formField);
                this.formFields[input.name.content.toString()] = new FormControl(value, req);
            }
        });
    }

    protected initForm(): void {
        this.formFields = {};
        this.inputStyles = [];
        this.collectFormFields(this.style);
        this.form = this.formBuilder.group(this.formFields);
    }

    protected prepareParams(value: { [key: string]: any; }): any {
        let params: { [key: string]: any } = {};
        params['__form_name'] = this.getFieldContent('name');
        this.inputStyles.forEach(formField => {
            if (this.selfhelpService.isFormField(formField)) {
                const input = this.selfhelpService.getFormField(formField);
                let fieldValue = value[input.name.content.toString()];
                if (input.style_name == 'input' && (<InputStyle>input).type_input.content == 'checkbox') {
                    // assign values to true/false for checkbox. Ionic need them as boolean
                    fieldValue = fieldValue ? this.getChildFieldDefault(formField, 'value') : null;
                }
                if (input.id) {
                    params[input.name.content.toString()] = {
                        id: input.id.content,
                        value: fieldValue
                    }
                } else {
                    // custom input not in DB, there is no id
                    params[input.name.content.toString()] = fieldValue;
                }
            }
        });
        return params;
    }

    public async submitForm(value: { [key: string]: any; }) {
        const res = await this.selfhelpService.submitForm(this.url, this.prepareParams(value));
        if (res && this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal('submit');
        }
        if (this.getFieldContent('redirect_at_end') != '') {
            this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
        }
    }

    public async submitFormAndSendEmail(value: { [key: string]: any; }) {
        let params = this.prepareParams(value);
        params['btnSubmitAndSend'] = 'send_email';
        const res = await this.selfhelpService.submitForm(this.url, params);
        if (res && this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal('submit');
        }
        if (this.getFieldContent('redirect_at_end') != '') {
            this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
        }
    }

}
