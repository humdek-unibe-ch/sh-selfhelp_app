import { Component, Input, OnInit } from '@angular/core';
import { VideoStyle, MediaContent } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { StringUtils } from 'turbocommons-ts';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-video-style',
    templateUrl: './video-style.component.html',
    styleUrls: ['./video-style.component.scss'],
})
export class VideoStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: VideoStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    ngOnInit() { }

    public getVideoSource(): MediaContent[] {
        return this.style.sources ?  <MediaContent[]>this.style.sources.content : null;
    }

    public getVideoUrl(videoUrl: MediaContent): string {
        if (StringUtils.isUrl(videoUrl.source)) {
            return videoUrl.source; 
        } else {
            let res = this.selfhelp.getApiEndPointNative() + '/' + videoUrl.source;
            return res;
        }
    }

}
