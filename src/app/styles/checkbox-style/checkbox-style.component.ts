import { Component, Input } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { CheckboxStyle } from 'src/app/selfhelpInterfaces';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-checkbox-style',
    templateUrl: './checkbox-style.component.html',
    styleUrls: ['./checkbox-style.component.scss'],
})
export class CheckboxStyleComponent extends BasicStyleComponent {
    @Input() override style!: CheckboxStyle;
    @Input() override parentForm!: FormGroup;

    constructor() {
        super();
    }
}
