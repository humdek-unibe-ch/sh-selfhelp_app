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
        this.selfhelp.openUrl(url);
    }

}
