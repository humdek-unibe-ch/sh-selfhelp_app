import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { QualtricsSurveyStyle } from '../../selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { iframeResizer } from 'iframe-resizer';

@Component({
    selector: 'app-qualtrics-survey-style',
    templateUrl: './qualtrics-survey-style.component.html',
    styleUrls: ['./qualtrics-survey-style.component.scss'],
})
export class QualtricsSurveyStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: QualtricsSurveyStyle;
    @ViewChild('iframe') iframe: ElementRef;

    constructor(private element: ElementRef) {
        super();
    }

    ngAfterViewInit() {
        if (!this.style['alert']) {
            iframeResizer({
                log: false,
                heightCalculationMethod: 'lowestElement',
                checkOrigin: false
            }, this.iframe.nativeElement);
        }
    }

}
