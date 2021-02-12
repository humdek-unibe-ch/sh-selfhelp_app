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
    private time = (new Date()).getTime();

    constructor(private selfhelpService: SelfhelpService, private detectChanges: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        console.log(this.style);
        if (this.style.show_survey && !this.isContainer()) {
            iframeResizer({
                log: false,
                heightCalculationMethod: 'lowestElement',
                checkOrigin: ["https://tpf-test.humdek.unibe.ch/blank/", "https://eu.qualtrics.com"],
            }, this.iframe.nativeElement);
        }
    }

    onLoad() {
        this.iFrameLoadCount++;
        if (this.iFrameLoadCount > 2) {
            this.iframe.nativeElement.remove();
            if(this.getFieldContent('close_modal_at_end') == '1'){
                this.selfhelpService.closeModal();
                this.selfhelpService.getPage(this.selfhelpService.API_HOME);
            }else{
                this.selfhelpService.getPage(this.url);
            }
        }
    }

    getQualtricsUrl() {
        if (this.getFieldContent('restart_on_refresh') == '1') {            
            return this.style.qualtrics_url + "&time=" + this.time;
        } else {
            return this.style.qualtrics_url;
        }
    }

    isContainer():boolean{
        return this.getFieldContent('use_as_container') && this.getFieldContent('use_as_container') == '1';
    }

}
