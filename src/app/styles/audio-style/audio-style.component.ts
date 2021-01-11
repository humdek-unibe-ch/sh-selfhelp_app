import { Component, Input, OnInit } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { StringUtils } from 'turbocommons-ts';
import { AudioStyle, MediaContent } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-audio-style',
    templateUrl: './audio-style.component.html',
    styleUrls: ['./audio-style.component.scss'],
})
export class AudioStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: AudioStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }


    ngOnInit() { }

    public getAudioSource(): MediaContent[] {
        return this.style.sources ?  <MediaContent[]>this.style.sources.content : null;
    }

    public getAudioUrl(videoUrl: MediaContent): string {
        if (StringUtils.isUrl(videoUrl.source)) {
            return videoUrl.source; 
        } else {
            let res = this.selfhelp.getApiEndPointNative() + '/' + videoUrl.source;
            return res;
        }
    }

}
