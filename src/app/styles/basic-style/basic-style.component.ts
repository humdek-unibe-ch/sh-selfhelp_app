import { Component, OnInit, Input } from '@angular/core';
import { Style } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-basic-style',
    templateUrl: './basic-style.component.html',
    styleUrls: ['./basic-style.component.scss'],
})
export class BasicStyleComponent implements OnInit {
    @Input() private style: Style;

    constructor() { }

    ngOnInit() { }

    public getStyle(): Style {
        return this.style;
    }

    public isStyle(name: string): boolean {
        return this.style.name == name;
    }

}
