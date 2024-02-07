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

    constructor(private selfhelpService: SelfhelpService, private zone: NgZone) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfhelp) {
                    this.selfhelp = selfhelp;
                }
            });
        });
    }

    ngOnInit() {
        this.setSelectedSubMenu();
    }

    getSubmenuIndex(): number {
        if (this.selfhelp && this.selfhelp.selectedMenu) {
            for (let index = 0; index < this.selfhelp.selectedMenu.children.length; index++) {
                const child = this.selfhelp.selectedMenu.children[index];
                if (child.url === this.selfhelp.current_url) {
                    return index;
                }
            }
        }
        return 0;
    }

    async setSelectedSubMenu() {
        if (this.selfhelp && this.selfhelp.selectedMenu) {
            this.selfhelpService.setSelectedSubMenu(this.selfhelp.selectedMenu.children[this.getSubmenuIndex()]);
            await this.selfhelpService.getPage(this.selfhelpService.getUrl(this.selfhelp.selectedMenu.children[this.getSubmenuIndex()]));
            await this.swiperRef?.nativeElement.swiper.slideTo(this.getSubmenuIndex(), 500);
        }
    }

    slideChanged() {
        this.setSelectedSubMenu();
    }

    public getContent(nav: SelfHelpNavigation): Styles | null {
        return this.selfhelpService.getContent(nav);
    }

}
