import { Component, NgZone, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { SelfHelp } from '../selfhelpInterfaces';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';


@Component({
    selector: 'app-navigation',
    templateUrl: 'navigation.page.html',
    styleUrls: ['navigation.page.scss']
})
export class NavigationPage {
    public selfHelp?: SelfHelp;
    private init = false;
    private external_css = 'external_css';
    @ViewChild('navigation') tabRef?: IonTabs;

    constructor(public selfHelpService: SelfhelpService, private zone: NgZone) {
        this.selfHelpService.observeSelfhelp().subscribe((selfHelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfHelp) {
                    this.selfHelp = selfHelp;
                    if (!this.selfHelp.selectedMenu && selfHelp.navigation.length > 0) {
                        //set default tab if none is selected, used in the initialization
                        this.init = true;
                        this.setTab(this.selfHelp.navigation[0]);
                    } else if (this.selfHelp.selectedMenu && !this.init) {
                        this.init = true;
                        this.selectMenu(this.selfHelp.selectedMenu);
                    }
                    let ext_css = document.getElementById(this.external_css);
                    if (ext_css) {
                        ext_css.innerHTML = '';
                        ext_css.appendChild(document.createTextNode(selfHelp.external_css));
                    } else {
                        // if the external css is not added yet, create it and add it
                        const head = document.getElementsByTagName('head')[0];
                        const style = document.createElement('style');
                        style.id = this.external_css;
                        style.type = 'text/css';
                        style.appendChild(document.createTextNode(selfHelp.external_css));
                        head.appendChild(style);
                    }
                }
            });
        });
    }

    ngOnInit(): void { }

    getTabName(nav: SelfHelpNavigation): string {
        return this.selfHelpService.getUrl(nav).replace('/', '');
    }

    async setTab(nav: SelfHelpNavigation) {
        this.selectMenu(nav);
        const res = await this.selfHelpService.getPage(this.selfHelpService.getUrl(nav));
    }

    selectMenu(nav: SelfHelpNavigation): void {
        if (this.selfHelp) {
            this.selfHelp.selectedMenu = nav;
            this.selfHelpService.setSelectedMenu(nav);
            if (this.tabRef) {
                this.tabRef.select(this.getTabName(this.selfHelp.selectedMenu));
            }
        }
    }

    public getIcon(nav: SelfHelpNavigation): string {
        return this.selfHelpService.getIcon(nav.icon);
    }

}
