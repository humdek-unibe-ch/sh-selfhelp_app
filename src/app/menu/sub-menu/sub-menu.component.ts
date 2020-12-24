import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { SelfHelp, SelfHelpNavigation, Styles } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-sub-menu',
    templateUrl: './sub-menu.component.html',
    styleUrls: ['./sub-menu.component.scss'],
})
export class SubMenuComponent implements OnInit {
    @Input() selfhelp: SelfHelp;
    @ViewChild('slides', { static: true }) slider: IonSlides;
    segment = 0;

    constructor(private selfhelpService: SelfhelpService) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.selfhelp = selfhelp;
            }
        });
    }

    ngOnInit() { }

    async setSelectedSubMenu() {
        this.selfhelpService.setSelectedSubMenu(this.selfhelp.selectedMenu.children[this.segment]);
        this.selfhelpService.getPage(this.selfhelpService.getUrl(this.selfhelp.selectedMenu.children[this.segment]));
        await this.slider.slideTo(this.segment);
    }

    async slideChanged() {
        this.segment = await this.slider.getActiveIndex();
    }

    public getContent(nav: SelfHelpNavigation): Styles {
        const res = this.selfhelpService.getContent(nav);
        // console.log(this.selfhelp.selectedMenu.keyword, res);
        return res;
    }    

}
