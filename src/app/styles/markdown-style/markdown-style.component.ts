import { Component, OnInit, Input } from '@angular/core';
import { MarkdownStyle } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-markdown-style',
    templateUrl: './markdown-style.component.html',
    styleUrls: ['./markdown-style.component.scss'],
})
export class MarkdownStyleComponent implements OnInit {
    @Input() public style:MarkdownStyle;

    constructor() { }

    ngOnInit() { }

}
