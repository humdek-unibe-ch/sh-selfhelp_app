import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonSlides } from '@ionic/angular';
import { Style, TabStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-tabs-style',
    templateUrl: './tabs-style.component.html',
    styleUrls: ['./tabs-style.component.scss'],
})
export class TabsStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: Style;
    @ViewChild('tabContent', { static: true }) slider: IonSlides;
    selectedTab = 0;
    sliderConfig = {
        autoHeight: true
    };

    constructor() {
        super();
    }

    ngOnInit() {
        for (let i = 0; i < this.style.children.length; i++) {
            const tab = <TabStyle>this.style.children[i];
            if (this.getChildFieldContent(tab, 'is_expanded') == '1'){
                this.slider.slideTo(i);
                break;
            }
        }
     }

    async setSelectedTab() {
        await this.slider.slideTo(this.selectedTab);
    }

    async tabChanged() {
        this.selectedTab = await this.slider.getActiveIndex();
    }

}
