import { Component, Input, OnInit } from '@angular/core';
import { NavigationContainerStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-navigation-container-style',
    templateUrl: './navigation-container-style.component.html',
    styleUrls: ['./navigation-container-style.component.scss'],
})
export class NavigationContainerStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: NavigationContainerStyle;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
