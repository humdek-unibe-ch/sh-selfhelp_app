import { Component, OnInit, Input } from '@angular/core';
import { ConditionalContainerStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-conditional-container-style',
    templateUrl: './conditional-container-style.component.html',
    styleUrls: ['./conditional-container-style.component.scss'],
})
export class ConditionalContainerStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ConditionalContainerStyle;
    @Input() override parentForm!: FormGroup;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
