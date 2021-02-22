import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { SelfhelpService } from '../../services/selfhelp.service';
import { SelfHelp } from '../../selfhelpInterfaces';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';
import { LoginComponent } from 'src/app/components/login/login.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';

@Component({
    selector: 'app-menu',
    templateUrl: 'menu.page.html',
    styleUrls: ['menu.page.scss']
})
export class MenuPage {

    public selfhelp: SelfHelp;

    constructor(private selfhelpService: SelfhelpService, private zone: NgZone) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfhelp) {
                    this.selfhelp = selfhelp;
                }
            });
        });
    }

    public getContent(nav: SelfHelpNavigation) {
        return this.selfhelpService.getContent(nav);
    }

    public profileOrLogin(): void {
        if (this.selfhelp.logged_in) {
            // show profile
            this.selfhelpService.getModalComponent(ProfileComponent);
        } else {
            // show login page
            this.selfhelpService.getModalComponent(LoginComponent);
        }
    }

    public getAvatar(): string {
        return this.selfhelpService.getAvatarImg();
    }

}