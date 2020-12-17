import { Component, OnInit, Input } from '@angular/core';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-sub-menu',
    templateUrl: './sub-menu.component.html',
    styleUrls: ['./sub-menu.component.scss'],
})
export class SubMenuComponent implements OnInit {
    @Input() navigation: SelfHelpNavigation;
    segment: any;
    slides: any;

    constructor() { }

    ngOnInit() {
        this.test();
     }

     private test() {
        this.segment = document.getElementsByClassName('segment-'+ this.navigation.keyword)[0];
        this.slides = document.getElementsByClassName('slides-'+ this.navigation.keyword)[0];

        this.segment.addEventListener('ionChange', (ev) => this.onSegmentChange(ev));
        this.slides.addEventListener('ionSlideDidChange', (ev) => this.onSlideDidChange(ev));
    }

    // On Segment change slide to the matching slide
    private onSegmentChange(ev) {
        this.slideTo(ev.detail.value);
    }

    private slideTo(index) {
        this.slides.slideTo(index);
    }

    // On Slide change update segment to the matching value
    private async onSlideDidChange(ev) {
        var index = await this.slides.getActiveIndex();
        this.clickSegment(index);
    }

    private clickSegment(index) {
        this.segment.value = index;
    }

}
