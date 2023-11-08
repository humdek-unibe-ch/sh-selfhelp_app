import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ModalStyle } from 'src/app/selfhelpInterfaces';
import { ModalController } from '@ionic/angular';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
declare var $: any;

@Component({
    selector: 'app-modal-style',
    templateUrl: './modal-style.component.html',
    styleUrls: ['./modal-style.component.css']
})
export class ModalStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ModalStyle;

    constructor(private modalController: ModalController, public selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
    }

    public closeModal() {
        this.selfhelpService.closeModal();
    }

    public async openModal() {
        console.log($('#modal-holder'));
        console.log('modal',this.style.children);
        const modal = await this.modalController.create({
            component: ModalStyleComponent,
            componentProps: {
                style: this.style,
                url: this.url,
                ionContent: this.ionContent
            },
            cssClass: '',
            keyboardClose: true,
            showBackdrop: true
        });

        return await modal.present();
    }

}
