import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ModalStyle } from 'src/app/selfhelpInterfaces';
import { ModalController } from '@ionic/angular';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-modal-style',
    templateUrl: './modal-style.component.html',
    styleUrls: ['./modal-style.component.css']
})
export class ModalStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ModalStyle;

    constructor(private selfhelpService: SelfhelpService, public modalController: ModalController) {
        super();
    }

    override ngOnInit() {

    }

    public closeModal() {
        this.selfhelpService.closeModal();
    }

    public async openModal() {
        const modal = await this.modalController.create({
            component: ModalStyleComponent,
            componentProps: {
                // src: this.getImgSource()
            },
            cssClass: 'ion-img-viewer',
            keyboardClose: true,
            showBackdrop: true
        });

        return await modal.present();
    }

}
