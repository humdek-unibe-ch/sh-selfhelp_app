import { Component, Input, OnInit } from '@angular/core';
import { ImageStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-image-style',
    templateUrl: './image-style.component.html',
    styleUrls: ['./image-style.component.scss'],
})
export class ImageStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ImageStyle;

    constructor(private selfhelp: SelfhelpService, public modalController: ModalController) {
        super();
    }

    override ngOnInit() { }

    public getImgSource(): string {
        const url = this.getFieldContent('source');
        if (this.selfhelp.isURL(url)) {
            return url;
        } else {
            return this.selfhelp.getApiEndPointNative() + '/' + url;
        }
    }

    async openViewer() {
        // if (this.getCss().includes('img-on-click')) {
        //     const modal = await this.modalController.create({
        //         component: ViewerModalComponent,
        //         componentProps: {
        //             src: this.getImgSource()
        //         },
        //         cssClass: 'ion-img-viewer',
        //         keyboardClose: true,
        //         showBackdrop: true
        //     });

        //     return await modal.present();
        // }
    }

}
