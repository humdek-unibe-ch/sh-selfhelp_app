import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { QualtricsSurveyStyle } from '../../selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { IFrameComponent, IFrameMessageData, iframeResizer } from 'iframe-resizer';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { GlobalsService } from 'src/app/services/globals.service';

@Component({
    selector: 'app-qualtrics-survey-style',
    templateUrl: './qualtrics-survey-style.component.html',
    styleUrls: ['./qualtrics-survey-style.component.scss'],
})
export class QualtricsSurveyStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: QualtricsSurveyStyle;
    @ViewChild('iframe') iframe!: ElementRef;
    private time = (new Date()).getTime();
    private component!: IFrameComponent | null;
    public init = false;

    constructor(private selfhelpService: SelfhelpService, private globals: GlobalsService) {
        super();
    }

    override ngOnInit() {
    }

    ngAfterViewInit() {
        this.initIFrame();
    }

    initIFrame() {
        if (this.style.show_survey && !this.isContainer() && !this.init) {
            this.init = true;
            const components = iframeResizer({
                log: false,
                messageCallback: (data: IFrameMessageData) => (this.iframeMessage(data)),
                heightCalculationMethod: 'taggedElement',
                checkOrigin: ["https://eu.qualtrics.com"],
            }, this.iframe.nativeElement);
            this.component = components && components.length > 0 ? components[0] : null;
        }
    }

    ngOnDestroy(): void {
        if (this.component && this.component.iFrameResizer) {
            this.component.iFrameResizer.close();
            this.time = (new Date()).getTime();
        }
    }

    iframeMessage(data: IFrameMessageData) {
        if (data.message == 'closeIFrame') {
            this.removeIFrame();
        }
    }

    removeIFrame() {
        this.iframe.nativeElement.remove();
        if (this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal('submit');
            if (this.getFieldContent('redirect_at_end') != '') {
                this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
            } else {
                this.selfhelpService.getPage(this.globals.SH_API_HOME);
            }
        } else {
            setTimeout(() => {
                // this.selfhelpService.getPage(this.url);// wiat 1 second in order to get the data from qualtrics
                this.selfhelpService.openUrl(this.url);
            }, 1000);
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
        const fieldContent = this.getFieldContent('use_as_container');
        return typeof fieldContent === 'string' ? fieldContent === '1' : !!fieldContent;
    }

}
