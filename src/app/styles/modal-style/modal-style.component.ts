import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ModalStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
declare var $: any;

@Component({
    selector: 'app-modal-style',
    templateUrl: './modal-style.component.html',
    styleUrls: ['./modal-style.component.css']
})
export class ModalStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: ModalStyle;

    constructor(public selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
    }

    public closeModal() {
        this.selfhelpService.closeModal('cancel');
    }

}
