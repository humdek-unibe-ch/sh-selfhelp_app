import { Component, Input, OnInit } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { AudioStyle, MediaContent } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-audio-style',
    templateUrl: './audio-style.component.html',
    styleUrls: ['./audio-style.component.scss'],
})
export class AudioStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: AudioStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }


    override ngOnInit() { }

    public getAudioSource(): MediaContent[] | null {
        return this.style.sources ?  <MediaContent[]>this.style.sources.content : null;
    }

    public getAudioUrl(videoUrl: MediaContent): string {
        if (this.selfhelp.isURL(videoUrl.source)) {
            return videoUrl.source;
        } else {
            let res = this.selfhelp.getApiEndPointNative() + '/' + videoUrl.source;
            return res;
        }
    }

}
