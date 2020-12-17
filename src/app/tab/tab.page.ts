import { Component } from '@angular/core';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelpPage } from './../selfhelpInterfaces';

@Component({
    selector: 'app-tab',
    templateUrl: 'tab.page.html',
    styleUrls: ['tab.page.scss']
})
export class TabPage {

    public page: SelfHelpPage;

    constructor(private selfhelp: SelfhelpService) {
        this.selfhelp.observePage().subscribe((page: SelfHelpPage) => {
            if (page) {
                // this.setContent(page);
                // this.setNavigation(page);
                this.page = page;
            }
        });
    }

    public getTitle(): string {
        if (this.page && this.page.navigation) {
            for (const nav of this.page.navigation) {
                if (nav.is_active) {
                    console.log('title', nav.title);
                    return nav.title;
                }
            }
        } else {
            return '';
        }
    }

    public hasChildren(): boolean {
        if (this.page && this.page.navigation) {
            for (const nav of this.page.navigation) {
                if (nav.is_active) {
                    return nav.children.length > 0;
                }
            }
        } else {
            return false;
        }

    }
}