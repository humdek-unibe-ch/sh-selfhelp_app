import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Style, TabStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-tabs-style',
    templateUrl: './tabs-style.component.html',
    styleUrls: ['./tabs-style.component.scss'],
})
export class TabsStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: Style;
    @ViewChild('tabContent', { static: true }) swiperRef!: ElementRef;
    selectedTab = 0;
    sliderConfig = {
        autoHeight: true
    };

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        for (let i = 0; i < this.style.children.length; i++) {
            const tab = <TabStyle>this.style.children[i];
            if (this.getChildFieldContent(tab, 'is_expanded') == '1') {
                this.swiperRef?.nativeElement.swiper.slideTo(i);
                break;
            }
        }
    }

    async setSelectedTab() {
        await this.swiperRef?.nativeElement.swiper.slideTo(this.selectedTab);
    }

    tabChanged() {
        this.selectedTab = this.swiperRef?.nativeElement.swiper.activeIndex;
    }

    getIcon(style: Style): string {
        return this.selfhelpService.getIcon(this.getChildFieldContent(style, 'icon'));
    }

}
