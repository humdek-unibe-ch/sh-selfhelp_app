import { Component, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { SelfHelpPage, TabMenuItem } from '../selfhelpInterfaces';
import { SelfhelpService } from '../services/selfhelp.service';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss']
})
export class TabsPage {
    @ViewChild('tabs', { static: false }) tabs: IonTabs;
    public tabMenu: TabMenuItem[];

    constructor(private selfhelp: SelfhelpService) {
        this.selfhelp.observePage().subscribe((page: SelfHelpPage) => {
            if (page) {
                this.setTabsMenu(page);
            }
        });
    }

    /**
     * @description Initialize the tabs which will be shown as menu
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @param {SelfHelpPage} page
     * @memberof TabsPage
     */
    public setTabsMenu(page: SelfHelpPage):void {
        this.tabMenu = [];
        page.navigation.forEach(nav => {
            this.tabMenu.push({
                title: nav.title,
                keyword: nav.keyword
            });
        });
        console.log('adjustTab', this.tabMenu);
    }

    /**
     * @description Set current tav on change and retrieve the page info from SelfHelp
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @memberof TabsPage
     */
    setCurrentTab(): void {        
        this.selfhelp.getPage(this.tabs.getSelected());
    }

}
