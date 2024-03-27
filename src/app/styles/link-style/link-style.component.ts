import { Component, Input, OnInit } from '@angular/core';
import { LinkStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-link-style',
    templateUrl: './link-style.component.html',
    styleUrls: ['./link-style.component.scss'],
})
export class LinkStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: LinkStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit() { }

    public btnClick(): void {
        const url = this.getFieldContent('url').replace(this.selfhelp.getBasePath() + '/', '/').replace('/http', 'http');
        if (url.startsWith('mailto:')) {
            // it is a mail
            window.location.href = url;
        } else {
            this.selfhelp.openUrl(url);
        }
    }

}
