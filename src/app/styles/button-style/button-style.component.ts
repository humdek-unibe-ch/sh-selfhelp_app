import { Component, Input, OnInit } from '@angular/core';
import { ButtonStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-button-style',
    templateUrl: './button-style.component.html',
    styleUrls: ['./button-style.component.scss'],
})
export class ButtonStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ButtonStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    public btnClick(): void {
        const url = this.getFieldContent('url').replace(this.selfhelp.getBasePath(), '');
        if (this.getFieldContent('confirmation_title') != '') {
            // check for confirmation first
            this.selfhelp.presentAlertConfirm({
                msg: this.getFieldContent('label_message'),
                header: this.getFieldContent('confirmation_title'),
                confirmLabel: this.getFieldContent('label_continue'),
                cancelLabel: this.getFieldContent('label_cancel'),
                callback: () => {
                    this.selfhelp.openUrl(url);
                }
            });
        } else {
            this.selfhelp.openUrl(url);
        }
    }

}
