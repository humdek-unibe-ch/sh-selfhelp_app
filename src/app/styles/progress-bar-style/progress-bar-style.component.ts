import { Component, Input, OnInit } from '@angular/core';
import { getDefaultSettings } from 'http2';
import { ProgressBarStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-progress-bar-style',
    templateUrl: './progress-bar-style.component.html',
    styleUrls: ['./progress-bar-style.component.scss'],
})
export class ProgressBarStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: ProgressBarStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

    public getProgress(): number {
        return 100 * parseInt(this.getFieldContent('count')) / parseInt(this.getFieldContent('count_max'));
    }

}
