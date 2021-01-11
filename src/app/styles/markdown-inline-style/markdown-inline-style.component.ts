import { Component, Input, OnInit } from '@angular/core';
import { MarkdownInlineStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-markdown-inline-style',
    templateUrl: './markdown-inline-style.component.html',
    styleUrls: ['./markdown-inline-style.component.scss'],
})
export class MarkdownInlineStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: MarkdownInlineStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
