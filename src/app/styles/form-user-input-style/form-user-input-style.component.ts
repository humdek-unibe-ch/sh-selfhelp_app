import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { FormUserInputStyle } from './../../selfhelpInterfaces';
import { BasicStyleComponent } from './../basic-style/basic-style.component';

@Component({
    selector: 'app-form-user-input-style',
    templateUrl: './form-user-input-style.component.html',
    styleUrls: ['./form-user-input-style.component.scss'],
})
export class FormUserInputStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: FormUserInputStyle;
s
    public form: FormGroup;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService) { 
        super();        
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            first_name: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required),
            datetime: new FormControl('')
        });
    }

    submitForm(value) {
        console.log(value);
        console.log(this.style);        
        let params = {};
        params['mobile'] = true;
        params['__form_name'] = this.style.form_name;
        this.style.children.forEach(formField => {
            params[formField.field_name] = {
                id: formField.id.content,
                value: value[formField.field_name]
            }
        });
        console.log('new value', params);
        this.selfhelpService.submitForm(this.url, params);
   }

}
