import { Component } from '@angular/core';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelpPage, Styles } from './../selfhelpInterfaces';

@Component({
    selector: 'app-tab',
    templateUrl: 'tab.page.html',
    styleUrls: ['tab.page.scss']
})
export class TabPage {

    public content: Styles = [];
    public title: string = '';

    constructor(private selfhelp: SelfhelpService) {
        this.selfhelp.observePage().subscribe((page: SelfHelpPage) => {
            if (page) {
                this.setContent(page);
                this.setTabTitle(page);
            }
        });
    }

    /**
     * @description Set page content
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {SelfHelpPage} page
     * @memberof TabPage
     */
    private setContent(page: SelfHelpPage): void {
        this.content = page.content;
    }


    /**
     * @description Set tab tittle
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {SelfHelpPage} page
     * @memberof TabPage
     */
    private setTabTitle(page: SelfHelpPage): void {
        page.navigation.forEach(nav => {
            if (nav.is_active) {
                this.title = nav.title;
            }
        });
    }

}
