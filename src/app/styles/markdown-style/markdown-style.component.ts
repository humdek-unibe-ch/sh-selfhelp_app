import { Component, OnInit, Input } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { MarkdownStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-markdown-style',
    templateUrl: './markdown-style.component.html',
    styleUrls: ['./markdown-style.component.scss'],
})
export class MarkdownStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: MarkdownStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
