import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { CalendarsStyle } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-calendars-style',
    templateUrl: './calendars-style.component.html',
    styleUrls: ['./calendars-style.component.css']
})
export class CalendarsStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: CalendarsStyle;

    constructor() {
        super();
    }

    override ngOnInit() {
        console.log("calendars", this.style);
    }

    addNewCalendar() {
        alert('new');
    }

    editCalendar(recordId: any) {
        alert('Edit ' + recordId);
    }
}
