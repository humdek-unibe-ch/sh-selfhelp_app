import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { SelfHelp, SelfHelpNavigation, Styles } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
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

    async setSelectedMenu() {
        this.selfhelpService.setSelectedMenu(this.selfhelp.navigation[this.segment]);
       this.selfhelpService.getPage(this.selfhelpService.getUrl(this.selfhelp.navigation[this.segment]));
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
