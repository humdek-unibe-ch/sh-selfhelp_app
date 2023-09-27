import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { MessageBoardStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-message-board-style',
    templateUrl: './message-board-style.component.html',
    styleUrls: ['./message-board-style.component.scss'],
})
export class MessageBoardStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: MessageBoardStyle;

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        this.ionContent.scrollToBottom(300);
    }

    getAvatar(avatar: string): string {
        if (!this.selfhelpService.isURL(avatar)) {
            return this.selfhelpService.getApiEndPointNative() + '/' + avatar;
        }
        return '';
    }

}
