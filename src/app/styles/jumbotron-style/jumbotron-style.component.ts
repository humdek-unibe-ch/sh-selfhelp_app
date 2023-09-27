import { Component, Input, OnInit } from '@angular/core';
import { Style } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-jumbotron-style',
    templateUrl: './jumbotron-style.component.html',
    styleUrls: ['./jumbotron-style.component.scss'],
})
export class JumbotronStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: Style;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
