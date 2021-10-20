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
    isCardExpanded: boolean;

    constructor() {
        super();
    }

    ngOnInit() {
        console.log(this.style);
        this.isCardExpanded = this.getFieldContent('is_expanded') == '1';
    }

    toggleCard() {
        if (this.getFieldContent('is_collapsible') == '1') {
            if (this.isCardExpanded) {
                this.isCardExpanded = false;
            } else {
                this.isCardExpanded = true;
            }
        }
    }

}
