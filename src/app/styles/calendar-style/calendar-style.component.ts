import { Component, Input, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { Platform } from '@ionic/angular';
import { CalendarComponent, CalendarMode } from 'ionic2-calendar';
import { CalendarStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

interface CalendarOptions {
    calendarMode: CalendarMode;
    currentDate: Date;
    formatDay: string;
    formatDayHeader: string;
    formatDayTitle: string;
    formatWeekTitle: string;
    formatMonthTitle: string;
    formatWeekViewDayHeader: string;
    formatHourColumn: string;
    showEventDetail: boolean;
    startingDayMonth: number;
    startingDayWeek: number;
    allDayLabel: string;
    noEventsLabel: string;
    step: number;
    timeInterval: number;
    autoSelect: boolean;
    dir: string;
    scrollToHour: number;
    preserveScrollPosition: boolean;
    lockSwipeToPrev: boolean;
    lockSwipes: boolean;
    locale: string;
    startHour: number;
    endHour: number;
    sliderOptions: Record<string, any>;
  }

@Component({
    selector: 'app-calendar-style',
    templateUrl: './calendar-style.component.html',
    styleUrls: ['./calendar-style.component.scss'],
})
export class CalendarStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: CalendarStyle;

    eventSource: any[] = [];
    viewTitle!: string;
    selectedDate: Date = new Date();

    calendar: CalendarOptions = {
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

    @ViewChild(CalendarComponent) myCal!: CalendarComponent;

    constructor(
        private nativeCal: Calendar,
        private plt: Platform
    ) {
        super();
        this.nativeCal.listCalendars().then(data => {
            this.calendars = data;
        });
    }

    override ngOnInit() {
        let config = this.getFieldContent('config');
        if (config) {
            for (let key of Object.keys(config)) {
                // @ts-ignore
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

    // Selected date range and hence title changed
    onViewTitleChanged(title: any) {
        this.viewTitle = title;
    }

    // Calendar event was clicked
    async onEventSelected() {
        // if (this.plt.is('ios')){
        //     this.nativeCal.modifyEvent(event.title, event.location, event.notes, event.startDate, event.endDate, 'new title', event.location, event.notes, event.startDate, event.endDate);
        // }else {
        this.nativeCal.openCalendar(this.selectedDate).then(
            (msg) => { console.log(msg); },
            (err) => { console.log(err); }
        );
        // }
    }

    changeMode(mode: CalendarMode) {
        this.calendar.calendarMode = mode;
    }

    onRangeChanged(event: any) {
        this.dataRange = event;
        if (this.plt.is('ios')) {
            // this.nativeCal.findAllEventsInNamedCalendar("stefan.kodzhabashev@gmail.com").then(data => {
            //     this.events = data;
            // });
            let start = event.startTime;
            let end = event.endTime;
            this.nativeCal.listEventsInRange(start, end).then(data => {
                this.events = data;
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
        events.forEach((event: any) => {
            if (!isIOS) {
                event['allDay'] = event.allDay == 1;
            } else {
                // event['allDay'] = moment(event.endDate).format('HH:mm:ss') === '23:59:59';
            }
            event['endTime'] = new Date(isIOS ? new Date(event.endDate).getTime() : new Date(event.dtend).getTime());

            event['endTime'] = new Date(isIOS ? new Date(event.endDate).getTime() : event.dtend);
            event['startTime'] = new Date(isIOS ? new Date(event.startDate).getTime(): event.dtstart);
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

    onCurrentDateChanged(ev: any) {
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
