import { Component, Input, OnInit } from '@angular/core';
import { ImageStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { StringUtils } from 'turbocommons-ts';

@Component({
    selector: 'app-image-style',
    templateUrl: './image-style.component.html',
    styleUrls: ['./image-style.component.scss'],
})
export class ImageStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: ImageStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    ngOnInit() { }

    public getImgSource(): string {
        const url = this.getFieldContent('source');
        if (StringUtils.isUrl(url)) {
            return url;
        } else {
            return this.selfhelp.getApiEndPointNative() + '/' + url;
        }
    }

}
