import { Component, OnInit, Input } from '@angular/core';
import { CardStyle } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-card-style',
    templateUrl: './card-style.component.html',
    styleUrls: ['./card-style.component.scss'],
})
export class CardStyleComponent implements OnInit {
    @Input() public style: CardStyle;

    constructor() { }

    ngOnInit() { }

}
