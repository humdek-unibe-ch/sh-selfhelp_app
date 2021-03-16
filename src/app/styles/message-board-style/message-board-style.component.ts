import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { MessageBoardStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { StringUtils } from 'turbocommons-ts';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-message-board-style',
    templateUrl: './message-board-style.component.html',
    styleUrls: ['./message-board-style.component.scss'],
})
export class MessageBoardStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: MessageBoardStyle;

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

    ngOnInit() {
        this.ionContent.scrollToBottom(300);
    }

    getAvatar(avatar: string): string {
        if (!StringUtils.isUrl(avatar)) {
            return this.selfhelpService.getApiEndPointNative() + '/' + avatar; 
        }
        return '';
    }

}
