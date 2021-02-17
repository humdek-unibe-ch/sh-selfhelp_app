import { Component, ElementRef, Input, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { QualtricsSurveyStyle } from '../../selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { IFrameComponent, IFrameMessageData, iframeResizer } from 'iframe-resizer';
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
    private component: IFrameComponent;

    constructor(private selfhelpService: SelfhelpService, private detectChanges: ChangeDetectorRef) {
        super();
    }

    ngAfterViewInit() {
        if (this.style.show_survey && !this.isContainer()) {
            const components = iframeResizer({
                log: false,
                messageCallback: (data:IFrameMessageData) => (this.iframeMessage(data)),
                heightCalculationMethod: 'lowestElement',
                checkOrigin: ["https://eu.qualtrics.com"],
            }, this.iframe.nativeElement);
            this.component = components && components.length > 0 ? components[0] : null;
        }
    }

    ngOnDestroy(): void {
        if (this.component && this.component.iFrameResizer) {
            this.component.iFrameResizer.close();
        }
    }

    onLoad() {
        this.iFrameLoadCount++;
        if (this.iFrameLoadCount > 2) {
            this.removeIFrame();
        }
    }

    iframeMessage(data:IFrameMessageData) {
        if(data.message == 'closeIFrame'){
            this.removeIFrame();
        }
    }

    removeIFrame() {
        this.iframe.nativeElement.remove();
        if (this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal();
            this.selfhelpService.getPage(this.selfhelpService.API_HOME);
        } else {
            this.selfhelpService.getPage(this.url);
        }
    }

    getQualtricsUrl() {
        if (this.getFieldContent('restart_on_refresh') == '1') {
            return this.style.qualtrics_url + "&time=" + this.time;
        } else {
            return this.style.qualtrics_url;
        }
    }

    isContainer(): boolean {
        return this.getFieldContent('use_as_container') && this.getFieldContent('use_as_container') == '1';
    }

}
