import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { QualtricsSurveyStyle } from '../selfhelpInterfaces';
import { BasicStyleComponent } from '../styles/basic-style/basic-style.component';
import { iframeResizer } from 'iframe-resizer';

@Component({
    selector: 'app-qualtrics-survey-style',
    templateUrl: './qualtrics-survey-style.component.html',
    styleUrls: ['./qualtrics-survey-style.component.scss'],
})
export class QualtricsSurveyStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: QualtricsSurveyStyle;

    constructor(private element: ElementRef) {
        super();
    }

    ngOnInit() { 
        iframeResizer({
            log: false,
            heightCalculationMethod: 'lowestElement',
            checkOrigin: false
        }, this.element.nativeElement.querySelector('iframe'));
    }

}
