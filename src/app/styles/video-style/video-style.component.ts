import { Component, Input, OnInit } from '@angular/core';
import { VideoStyle, MediaContent } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-video-style',
    templateUrl: './video-style.component.html',
    styleUrls: ['./video-style.component.scss'],
})
export class VideoStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: VideoStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit() { }

    public getVideoSource(): MediaContent[] | null {
        return this.style.sources ?  <MediaContent[]>this.style.sources.content : null;
    }

    public getVideoUrl(videoUrl: MediaContent): string {
        if (this.selfhelp.isURL(videoUrl.source)) {
            return videoUrl.source;
        } else {
            let res = this.selfhelp.getApiEndPointNative() + '/' + videoUrl.source;
            return res;
        }
    }

}
