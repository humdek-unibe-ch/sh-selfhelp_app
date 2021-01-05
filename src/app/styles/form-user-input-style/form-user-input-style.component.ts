import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { FormUserInputStyle } from './../../selfhelpInterfaces';
import { BasicStyleComponent } from './../basic-style/basic-style.component';
import { InputStyle } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-form-user-input-style',
    templateUrl: './form-user-input-style.component.html',
    styleUrls: ['./form-user-input-style.component.scss'],
})
export class FormUserInputStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: FormUserInputStyle;
    public form: FormGroup;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        let formFields = {};
        this.style.children.forEach(formField => {
            if (formField.style_name && formField.style_name == 'input') {
                const input = <InputStyle>formField;
                let value = input.value ? input.value.content : ''; // if there is a default value we assign it
                if(this.style.is_log.content != '1' && input.last_value){
                    value = input.last_value; // the form is not a log, get the last value
                }
                const req = input.is_required.content == '1' ? Validators.required : null;
                formFields[input.name.content] = new FormControl(value, req);
            }
        });
        this.form = this.formBuilder.group(formFields);
    }

    prepareParams(value): any{
        let params = {};
        params['mobile'] = true;
        params['__form_name'] = this.style.name.content;
        this.style.children.forEach(formField => {
            if (formField.style_name && formField.style_name == 'input') {
                const input = <InputStyle>formField;
                params[input.name.content] = {
                    id: input.id.content,
                    value: value[input.name.content]
                }
            }
        });
        return params;
    }

    submitForm(value) {        
        this.selfhelpService.submitForm(this.url, this.prepareParams(value));
    }

    submitFormAndSendEmail(value) {
        let params = this.prepareParams(value);
        params['btnSubmitAndSend'] = 'send_email';
        this.selfhelpService.submitForm(this.url, params);
    }

}
