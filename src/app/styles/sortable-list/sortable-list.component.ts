import { Component, Input, OnInit } from '@angular/core';
import { SortableListStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-sortable-list',
    templateUrl: './sortable-list.component.html',
    styleUrls: ['./sortable-list.component.scss'],
})
export class SortableListComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: SortableListStyle;

    constructor() {
        super();
    }

    override ngOnInit() { }

}
