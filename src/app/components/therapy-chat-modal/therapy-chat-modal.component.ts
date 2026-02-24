import { Component, Injector, Input, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-therapy-chat-modal',
    templateUrl: './therapy-chat-modal.component.html',
    styleUrls: ['./therapy-chat-modal.component.scss'],
})
export class TherapyChatModalComponent extends BasicComponentComponent implements OnInit {
    @Input() url_param!: string;
    @Input() title: string = 'Therapy Chat';
    @Input() icon: string = 'chatbubbles';
    @Input() unreadCount: number = 0;

    constructor(injector: Injector, zone: NgZone) {
        super(injector, zone);
    }

    override async ngOnInit() {
        this.url = this.url_param;
    }

    get displayTitle(): string {
        return this.title || this.getTitle() || 'Therapy Chat';
    }

    isMissing(): boolean {
        if (!this.selfHelp.urls[this.url]?.content) {
            return false;
        }
        return this.selfHelp.urls[this.url].content.length > 0
            && String(this.selfHelp.urls[this.url].content[0]) === 'missing';
    }
}
