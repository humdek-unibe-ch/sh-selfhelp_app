import { Component, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { SelfHelp } from '../selfhelpInterfaces';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';


@Component({
    selector: 'app-navigation',
    templateUrl: 'navigation.page.html',
    styleUrls: ['navigation.page.scss']
})
export class TabsPage {
    public selfhelp: SelfHelp;
    private init = false;
    @ViewChild('navigation') tabRef: IonTabs;

    constructor(public selfhelpService: SelfhelpService) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.selfhelp = selfhelp;
                if (!this.selfhelp.selectedMenu && selfhelp.navigation.length > 0) {
                    //set default tab if none is selected, used in the initialization
                    this.init = true;
                    this.setTab(this.selfhelp.navigation[0]);
                } else if (this.selfhelp.selectedMenu && !this.init) {
                    this.init = true;
                    this.selectMenu(this.selfhelp.selectedMenu);
                }
            }
        });
    }

    ngOnInit(): void {

    }

    getTabName(nav: SelfHelpNavigation): string {
        return this.selfhelpService.getUrl(nav).replace('/', '');
    }

    setTab(nav: SelfHelpNavigation): void {
        this.selectMenu(nav);
        this.selfhelpService.getPage(this.selfhelpService.getUrl(nav));
    }

    selectMenu(nav: SelfHelpNavigation): void {
        this.selfhelp.selectedMenu = nav;
        this.selfhelpService.setSelectedMenu(nav);
        this.tabRef.select(this.getTabName(this.selfhelp.selectedMenu));
    }

}
