import { Component, OnInit, Input } from '@angular/core';
import { CardStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-card-style',
    templateUrl: './card-style.component.html',
    styleUrls: ['./card-style.component.scss'],
})
export class CardStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: CardStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
