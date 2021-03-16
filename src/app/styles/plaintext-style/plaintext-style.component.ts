import { Component, Input, OnInit } from '@angular/core';
import { PlaintextStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-plaintext-style',
    templateUrl: './plaintext-style.component.html',
    styleUrls: ['./plaintext-style.component.scss'],
})
export class PlaintextStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: PlaintextStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
