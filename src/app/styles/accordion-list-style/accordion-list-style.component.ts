import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { AccordionListStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-accordion-list-style',
    templateUrl: './accordion-list-style.component.html',
    styleUrls: ['./accordion-list-style.component.scss'],
})
export class AccordionListStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: AccordionListStyle;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
