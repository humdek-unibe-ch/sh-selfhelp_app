import { Component, OnInit, Input } from '@angular/core';
import { ContainerStyle } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-container-style',
    templateUrl: './container-style.component.html',
    styleUrls: ['./container-style.component.scss'],
})
export class ContainerStyleComponent implements OnInit {
    @Input() public style: ContainerStyle;

    constructor() { }

    ngOnInit() { }

}
