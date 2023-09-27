import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AlertStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-alert-style',
    templateUrl: './alert-style.component.html',
    styleUrls: ['./alert-style.component.scss'],
})
export class AlertStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: AlertStyle;
    @ViewChild('alert', { static: true }) alertRef!: ElementRef;

    constructor() {
        super();
    }

    override ngOnInit() { }

    dismiss() {
        this.alertRef.nativeElement.remove();
    }

}
