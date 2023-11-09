import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { InputStyle } from 'src/app/selfhelpInterfaces';
import { FormGroup } from '@angular/forms';
import { formatISO } from 'date-fns';

@Component({
    selector: 'app-input-style',
    templateUrl: './input-style.component.html',
    styleUrls: ['./input-style.component.scss'],
})

export class InputStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: InputStyle;
    @Input() override parentForm!: FormGroup;

    constructor() {
        super();
    }

    override ngOnInit() {
        console.log(this.getFieldContent('name'));
        if(this.getFieldContent('name') === 'datetime' || this.getFieldContent('name') === 'date'){
            this.parentForm.controls[this.getFieldContent('name')].setValue(formatISO(new Date(this.parentForm.controls[this.getFieldContent('name')].value)));
        }
    }

    formatDate(controlName: any){
        console.log(controlName);
        this.parentForm.controls[controlName].setValue(this.parentForm.controls[controlName].value.split('T')[0]);
    }

    formatDateTime(controlName: any){
        if(this.parentForm.controls[controlName].value.includes('+')){
            let time = this.parentForm.controls[controlName].value.split('+')[0];
            console.log(time.split('T')[0] + " " + time.split('T')[1]);
            this.parentForm.controls[controlName].setValue(time.split('T')[0] + " " + time.split('T')[1]);
        }
    }


}
