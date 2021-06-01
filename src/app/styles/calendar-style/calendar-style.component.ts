import { Component, Input, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Calendar } from '@ionic-native/calendar/ngx';
import { Platform } from '@ionic/angular';
import { CalendarComponent } from 'ionic2-calendar';
import { CalendarStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import * as moment from 'moment';


@Component({
    selector: 'app-calendar-style',
    templateUrl: './calendar-style.component.html',
    styleUrls: ['./calendar-style.component.scss'],
})
export class CalendarStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: CalendarStyle;

    eventSource = [];
    viewTitle: string;
    selectedDate: Date = new Date();

    calendar = {
        calendarMode: 'month',
        currentDate: new Date(),
        formatDay: 'dd',
        formatDayHeader: 'EEE',
        formatDayTitle: 'MMMM dd, yyyy',
        formatWeekTitle: 'MMMM yyyy, Week, w',
        formatMonthTitle: 'MMMM yyyy',
        formatWeekViewDayHeader: 'EEE d',
        formatHourColumn: 'ha',
        showEventDetail: true,
        startingDayMonth: 0,
        startingDayWeek: 0,
        allDayLabel: 'all day',
        noEventsLabel: 'No Events',
        step: 60,
        timeInterval: 60,
        autoSelect: true,
        dir: "",
        scrollToHour: 0,
        preserveScrollPosition: false,
        lockSwipeToPrev: false,
        lockSwipes: false,
        locale: 'de-DE',
        startHour: 0,
        endHour: 24,
        sliderOptions: {},
    }

    calendars = [];
    events = [];
    dataRange: any;

    @ViewChild(CalendarComponent) myCal: CalendarComponent;

    constructor(
        private nativeCal: Calendar,
        private plt: Platform
    ) {
        super();
        this.nativeCal.listCalendars().then(data => {
            this.calendars = data;
        });
    }

    ngOnInit() {
        let config = this.getFieldContent('config');
        if (config) {
            for (let key of Object.keys(config)) {
                this.calendar[key] = config[key];
            }
        }
    }

    // Change current month/week/day
    next() {
        this.myCal.slideNext();
    }

    back() {
        this.myCal.slidePrev();
    }

    // Selected date reange and hence title changed
    onViewTitleChanged(title) {
        this.viewTitle = title;
    }

    // Calendar event was clicked
    async onEventSelected(event) {
        // if (this.plt.is('ios')){
        //     this.nativeCal.modifyEvent(event.title, event.location, event.notes, event.startDate, event.endDate, 'new title', event.location, event.notes, event.startDate, event.endDate); 
        // }else {
        this.nativeCal.openCalendar(this.selectedDate).then(
            (msg) => { console.log(msg); },
            (err) => { console.log(err); }
        );
        // }
    }

    changeMode(mode) {
        this.calendar.calendarMode = mode;
    }

    onRangeChanged(event) {
        this.dataRange = event;
        if (this.plt.is('ios')) {
            // this.nativeCal.findAllEventsInNamedCalendar("stefan.kodzhabashev@gmail.com").then(data => {
            //     this.events = data;
            // });
            let start = event.startTime;
            let end = event.endTime;
            console.log(this.nativeCal);
            this.nativeCal.listEventsInRange(start, end).then(data => {
                this.events = data;
                console.log(this.events);
                this.loadEventsInCalendar(data);
            });
        } else if (this.plt.is('android')) {
            let start = event.startTime;
            let end = event.endTime;

            this.nativeCal.listEventsInRange(start, end).then(data => {
                this.events = data;
                this.loadEventsInCalendar(data);
            });
        }
    }

    loadEventsInCalendar(events: any) {
        this.eventSource = [];
        const isIOS = this.plt.is('ios');
        events.forEach(event => {
            if (!isIOS) {
                event['allDay'] = event.allDay == 1;
            } else {
                // event['allDay'] = moment(event.endDate).format('HH:mm:ss') === '23:59:59';
            }
            event['endTime'] = new Date(isIOS ? moment(event.endDate).toDate() : event.dtend);
            event['startTime'] = new Date(isIOS ? moment(event.startDate).toDate() : event.dtstart);
            this.eventSource.push(event);
        });
    }

    addEvent() {
        this.nativeCal.createEventInteractively('', '', '', this.selectedDate, this.selectedDate).then(res => {
            this.onRangeChanged(this.dataRange);
        }, err => {
            console.log('err: ', err);
        });
    }

    onCurrentDateChanged(ev) {
        this.selectedDate = ev;
    }

    getBtnSize(): number {
        let buttonsNumbers = 0;
        if (this.getFieldContent('label_month')) {
            buttonsNumbers++;
        }
        if (this.getFieldContent('label_week')) {
            buttonsNumbers++;
        }
        if (this.getFieldContent('label_day')) {
            buttonsNumbers++;
        }
        return buttonsNumbers == 0 ? 0 : 12 / buttonsNumbers;
    }

}
