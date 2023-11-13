import { Component, OnInit, Input, ViewChild, NgZone, ElementRef } from '@angular/core';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { SelfHelp, SelfHelpNavigation, Styles } from '../../selfhelpInterfaces';

@Component({
    selector: 'app-sub-menu',
    templateUrl: './sub-menu.component.html',
    styleUrls: ['./sub-menu.component.scss'],
})
export class SubMenuComponent implements OnInit {
    @Input() selfhelp!: SelfHelp;
    @ViewChild('slides', { static: true }) swiperRef!: ElementRef;
    segment = 0;

    constructor(private selfhelpService: SelfhelpService, private zone: NgZone) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfhelp) {
                    this.selfhelp = selfhelp;
                }
            });
        });
    }

    ngOnInit() { }

    async setSelectedSubMenu() {
        if (this.selfhelp && this.selfhelp.selectedMenu) {
            this.selfhelpService.setSelectedSubMenu(this.selfhelp.selectedMenu.children[this.segment]);
            this.selfhelpService.getPage(this.selfhelpService.getUrl(this.selfhelp.selectedMenu.children[this.segment]));
            await this.swiperRef?.nativeElement.swiper.slideTo(this.segment);
        }
    }

    slideChanged() {
        this.segment = this.swiperRef?.nativeElement.swiper.activeIndex;
    }

    public getContent(nav: SelfHelpNavigation): Styles | null {
        return this.selfhelpService.getContent(nav);
    }

}
