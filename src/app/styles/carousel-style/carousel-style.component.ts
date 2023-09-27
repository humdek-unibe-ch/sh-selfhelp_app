import { Component, Input, OnInit } from '@angular/core';
import { CarouselStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-carousel-style',
    templateUrl: './carousel-style.component.html',
    styleUrls: ['./carousel-style.component.scss'],
})
export class CarouselStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: CarouselStyle;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit() { }

    public getSrc(value: string): string {
        if (this.selfhelp.isURL(value)) {
            return value;
        } else {
            return this.selfhelp.getApiEndPointNative() + '/' + value;
        }
    }

}
