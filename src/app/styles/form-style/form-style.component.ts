import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { FormUserInputStyleComponent } from './../form-user-input-style/form-user-input-style.component';

@Component({
  selector: 'app-form-style',
  templateUrl: './form-style.component.html',
  styleUrls: ['./form-style.component.scss'],
})
export class FormStyleComponent extends FormUserInputStyleComponent {

    constructor(formBuilder: FormBuilder, selfhelpService: SelfhelpService) {
        super(formBuilder, selfhelpService);
    }

    protected override prepareParams(value: { [key: string]: any; }): any {
        return value;
    }

}
