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

    public selfHelp?: SelfHelp;

    constructor(private selfHelpService: SelfhelpService, private zone: NgZone) {
        this.selfHelpService.observeSelfhelp().subscribe((selfHelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfHelp) {
                    this.selfHelp = selfHelp;
                }
            });
        });
    }

    public getContent(nav: SelfHelpNavigation) {
        return this.selfHelpService.getContent(nav);
    }

    public profileOrLogin(): void {
        if (this.selfHelp && this.selfHelp.logged_in) {
            // show profile
            this.selfHelpService.getModalComponent(ProfileComponent);
        } else {
            // show login page
            this.selfHelpService.getModalComponent(LoginComponent);
        }
    }

    public getAvatar(): string {
        return this.selfHelpService.getAvatarImg();
    }

    showHeader() {
        return !this.selfHelp?.is_headless;
    }

}
