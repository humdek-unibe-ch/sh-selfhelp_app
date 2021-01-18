import { Component } from '@angular/core';
import { SelfhelpService } from '../../services/selfhelp.service';
import { SelfHelp } from '../../selfhelpInterfaces';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';
import { ModalController } from '@ionic/angular';
import { LoginComponent } from 'src/app/components/login/login.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';

@Component({
    selector: 'app-menu',
    templateUrl: 'menu.page.html',
    styleUrls: ['menu.page.scss']
})
export class TabPage {

    public selfhelp: SelfHelp;

    constructor(private selfhelpService: SelfhelpService, private modalController: ModalController) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.selfhelp = selfhelp;
            }
        });
    }

    public getContent(nav: SelfHelpNavigation) {
        return this.selfhelpService.getContent(nav);
    }

    public profileOrLogin(): void {
        if (this.selfhelp.logged_in) {
            // show profile
            this.showProfile();
        } else {
            // show login page
            this.showLogin();
        }
    }

    private async showLogin() {
        const modal = await this.modalController.create({
            component: LoginComponent,
            swipeToClose: true,
            backdropDismiss: true,
            showBackdrop: true,
            cssClass: ''
        });
        return await modal.present();
    }

    private async showProfile() {
        const modal = await this.modalController.create({
            component: ProfileComponent,
            swipeToClose: true,
            backdropDismiss: true,
            showBackdrop: true,
            cssClass: ''
        });
        return await modal.present();
    }

}