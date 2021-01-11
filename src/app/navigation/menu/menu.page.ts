import { Component } from '@angular/core';
import { SelfhelpService } from '../../services/selfhelp.service';
import { SelfHelp } from '../../selfhelpInterfaces';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-menu',
    templateUrl: 'menu.page.html',
    styleUrls: ['menu.page.scss']
})
export class TabPage {

    public selfhelp: SelfHelp;

    constructor(private selfhelpService: SelfhelpService) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.selfhelp = selfhelp;
            }
        });
    }

    public getContent(nav: SelfHelpNavigation){
        return this.selfhelpService.getContent(nav);
    }
    
}