import { Component, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-shepherd-js-style',
    templateUrl: './shepherd-js-style.component.html',
    styleUrls: ['./shepherd-js-style.component.scss'],
})
export class ShepherdJsStyleComponent extends BasicStyleComponent implements OnInit {

    constructor() {
        super();
    }

    override ngOnInit() {
        console.log(this.style);
     }

}
