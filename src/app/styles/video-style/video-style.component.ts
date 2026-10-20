import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { VideoStyle, MediaContent } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-video-style',
    templateUrl: './video-style.component.html',
    styleUrls: ['./video-style.component.scss'],
    standalone: false
})
export class VideoStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy {
    @Input() override style!: VideoStyle;
    @ViewChild('video') private videoRef?: ElementRef<HTMLVideoElement>;

    // Watch-progress tracking, same lifecycle as the web video.js.
    private timerId: ReturnType<typeof setInterval> | null = null;
    private sessionActive = false;
    private onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            this.flushIfActive();
        }
    };

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        if (this.isTracking()) {
            document.addEventListener('visibilitychange', this.onVisibilityChange);
        }
    }

    ngOnDestroy() {
        // Leaving the page is the app's pagehide.
        this.flushIfActive();
        this.clearHeartbeat();
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }

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

    public onPlay() {
        if (!this.isTracking()) {
            return;
        }
        const isNewSession = !this.sessionActive;
        this.sessionActive = true;
        if (isNewSession) {
            this.sendEvent('play');
        }
        this.startHeartbeat();
    }

    public onPause() {
        this.clearHeartbeat();
    }

    public onEnded() {
        if (!this.isTracking()) {
            return;
        }
        this.sendEvent('ended');
        this.clearHeartbeat();
        this.sessionActive = false;
    }

    private isTracking(): boolean {
        return this.getFieldContent('track_enabled') == '1'
            && this.getIntervalSec() > 0
            && !!this.getID()
            && this.getFieldContent('track_page_keyword') != '';
    }

    private getIntervalSec(): number {
        return parseInt(this.getFieldContent('track_interval_seconds'), 10) || 0;
    }

    private startHeartbeat() {
        this.clearHeartbeat();
        this.timerId = setInterval(() => {
            const video = this.videoRef?.nativeElement;
            if (!video || video.paused || video.ended || !this.sessionActive) {
                return;
            }
            this.sendEvent('heartbeat');
        }, this.getIntervalSec() * 1000);
    }

    private clearHeartbeat() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    private flushIfActive() {
        if (this.sessionActive && !this.videoRef?.nativeElement.ended) {
            this.sendEvent('heartbeat');
        }
    }

    private sendEvent(eventName: string) {
        const video = this.videoRef?.nativeElement;
        if (!video) {
            return;
        }
        const currentTime = isFinite(video.currentTime) ? video.currentTime : 0;
        const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        let percent = 0;
        if (duration > 0) {
            percent = Math.min(100, Math.max(0, (currentTime / duration) * 100));
        } else if (eventName === 'ended') {
            percent = 100;
        }
        // A lost event must not disturb playback.
        this.selfhelp.execServerRequest('/request/AjaxVideoTrack/track', {
            event: eventName,
            section_id: this.getID(),
            page_keyword: this.getFieldContent('track_page_keyword'),
            currentTime: currentTime,
            duration: duration,
            percent: percent,
            source: this.getFieldContent('track_source')
        }).catch(() => { });
    }

}
