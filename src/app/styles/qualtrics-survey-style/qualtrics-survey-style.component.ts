import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { QualtricsSurveyStyle } from '../../selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { iframeResizer } from 'iframe-resizer';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-qualtrics-survey-style',
    templateUrl: './qualtrics-survey-style.component.html',
    styleUrls: ['./qualtrics-survey-style.component.scss'],
})
export class QualtricsSurveyStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: QualtricsSurveyStyle;
    @ViewChild('iframe') iframe: ElementRef;
    private iFrameLoadCount = 0;

    constructor(private selfhelpService: SelfhelpService, private detectChanges: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        console.log(this.style);
        if (this.style.show_survey) {
            iframeResizer({
                log: false,
                heightCalculationMethod: 'lowestElement',
                checkOrigin: ["https://tpf-test.humdek.unibe.ch/blank/", "https://eu.qualtrics.com"],
            }, this.iframe.nativeElement);
        }
    }

    onLoad() {
        this.iFrameLoadCount++;
        console.log('Counter', this.iFrameLoadCount);
        if (this.iFrameLoadCount > 2) {            
            this.iframe.nativeElement.remove();
            this.selfhelpService.getPage(this.url);
            console.log('Survey Done'); 
        }
    }

    async refreshPage() {
        const reload = await this.selfhelpService.getPage(this.url);
        // this.selfhelpService.openUrl(this.url); 
        // this.detectChanges.detectChanges();
    }

}
