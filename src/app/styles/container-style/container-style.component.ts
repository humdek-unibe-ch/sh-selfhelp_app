import { Component, OnInit, Input } from '@angular/core';
import { ContainerStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-container-style',
    templateUrl: './container-style.component.html',
    styleUrls: ['./container-style.component.scss'],
})
export class ContainerStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ContainerStyle;
    @Input() override parentForm!: FormGroup;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
