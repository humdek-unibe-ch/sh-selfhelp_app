import { Component, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { SelfHelp, TabMenuItem } from '../selfhelpInterfaces';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';


@Component({
    selector: 'app-navigation',
    templateUrl: 'navigation.page.html',
    styleUrls: ['navigation.page.scss']
})
export class TabsPage {
    public selfhelp: SelfHelp;

    constructor(public selfhelpService: SelfhelpService) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.selfhelp = selfhelp;
                if (!this.selfhelp.selectedMenu && selfhelp.navigation.length > 0) {
                    //set default tab if none is selected, used in the initialization
                    this.setTab(this.selfhelp.navigation[0]);
                }
            }
        });
    }

    ngOnInit(): void {

    }

    setTab(nav: SelfHelpNavigation): void {
        this.selfhelp.selectedMenu = nav;
        this.selfhelpService.setSelectedMenu(nav);
        this.selfhelpService.getPage(this.selfhelpService.getUrl(nav));
    }

}
