import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CalendarStyle, Style } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarOptions } from '@fullcalendar/core';
import { addDays, format } from 'date-fns';
import { ModalStyleComponent } from '../modal-style/modal-style.component';
import { ModalController } from '@ionic/angular';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
declare var $: any;

@Component({
    selector: 'app-calendar-style',
    templateUrl: './calendar-style.component.html',
    styleUrls: ['./calendar-style.component.scss'],
})
export class CalendarStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: CalendarStyle;
    @ViewChild('modalAddEvent') modalAddEvent?: ModalStyleComponent;

    eventSource: any[] = [];
    viewTitle!: string;
    selectedDate: Date = new Date();
    calendars = [];
    events = [];
    dataRange: any;
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        themeSystem: 'bootstrap',
        plugins: [dayGridPlugin]
    };
    calendarFormFields: any;

    constructor(private modalController: ModalController, private selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        console.log("calendar", this.style);
        console.log("calendar form", this.style['style_add_event']);
        this.setCalendarOptions();
    }


    /**
     * @description Set Full calendar options
     * @author Stefan Kodzhabashev
     * @date 09/11/2023
     * @memberof CalendarStyleComponent
     */
    setCalendarOptions() {
        let calendar_data = this.style['calendar_values'];
        let events = this.style['events'];
        console.log('calendar', calendar_data);
        let buttons = this.get_custom_buttons(calendar_data);
        this.calendarOptions = {
            initialView: 'dayGridMonth',
            themeSystem: 'bootstrap',
            plugins: [dayGridPlugin],
            locale: calendar_data['locale'],
            headerToolbar: {
                left: buttons['buttons'],
                // center: 'title',
                right: 'dayGridMonth,dayGridWeek,dayGridDay,listWeek'
            },
            customButtons: buttons['customButtons'],
            buttonText: {
                today: calendar_data['label_today'],
                day: calendar_data['label_day'],
                week: calendar_data['label_week'],
                month: calendar_data['label_month'],
                list: calendar_data['label_list']
            },
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false, // Set to true for 12-hour format with AM/PM
                // hourCycle: `h23`
            },
            eventOverlap: true,
            weekNumbers: true,
            weekNumberFormat: {
                week: 'short'
            },
            height: calendar_data['config']['height'] ? calendar_data['config']['height'] : 'auto',
            firstDay: 1,
            events: this.prepare_events(events, calendar_data['config']),
            eventClick: async (info) => {
                let entryValues = info.event.extendedProps;
                this.calendarFormFields = {}; //reset them
                console.log(entryValues);
                console.log(this.calendarFormFields);
                let eventInfo: any = {};
                Object.keys(entryValues).forEach(key => {
                    if (key.startsWith("_")) {
                        // set the value from the event
                        let fieldName = key.replace('_', '');
                        eventInfo[fieldName] = entryValues[key];
                    }
                });
                console.log(eventInfo);
                this.propagateFields(this.style['style_edit_event'].children, eventInfo);
                console.log("calendar form", this.style['style_edit_event']);
                const modal = await this.modalController.create({
                    component: ModalStyleComponent,
                    componentProps: {
                        style: this.style['style_edit_event'],
                        url: this.url,
                        ionContent: this.ionContent
                    },
                    cssClass: '',
                    keyboardClose: true,
                    showBackdrop: true
                });
                return await modal.present();
            }
        };
    }

    /**
     * @description Load custom buttons for the calendar
     * @author Stefan Kodzhabashev
     * @date 09/11/2023
     * @param {*} calendar_data the calendar data
     * @return {*} return object with the custom buttons
     * @memberof CalendarStyleComponent
     */
    get_custom_buttons(calendar_data: any) {
        var buttons = 'prev,next,today,addEventButton';
        if (calendar_data['show_add_calendar_button'] == '1') {
            // show add calendar btn if enabled
            buttons = 'prev,next,today,addCalendarButton,addEventButton';
        }
        var res = {
            customButtons: {
                addEventButton: {
                    text: calendar_data['label_calendar_add_event'],
                    click: async () => {
                        console.log('style_add_event', this.style['style_add_event']);
                        this.initEventFields(this.style['style_add_event'].children);
                        const modal = await this.modalController.create({
                            component: ModalStyleComponent,
                            componentProps: {
                                style: this.style['style_add_event'],
                                url: this.url,
                                ionContent: this.ionContent
                            },
                            cssClass: '',
                            keyboardClose: true,
                            showBackdrop: true
                        });
                        return await modal.present();
                    }
                },
                addCalendarButton: {
                    text: calendar_data['label_add_calendar'],
                    click: async () => {
                        // const modal = await this.modalController.create({
                        //     component: ModalStyleComponent,
                        //     componentProps: {
                        //         style: this.style['style_edit_event'],
                        //         url: this.url,
                        //         ionContent: this.ionContent
                        //     },
                        //     cssClass: '',
                        //     keyboardClose: true,
                        //     showBackdrop: true
                        // });
                        // return await modal.present();
                    }
                }
            },
            buttons: buttons
        }
        console.log(res)
        return res;
    }


    initEventFields(styles: Style[]) {
        styles.forEach((formField: Style) => {
            if (formField['children'] && formField['children'].length > 0) {
                this.initEventFields(formField['children']);
            } else if (this.selfhelpService.isFormField(formField)) {
                if (formField['last_value']) {
                    formField['last_value'] = null; // clear the form
                }
            }
        });
    }

    /**
 * Prepare the  events for display in the calendar.
 * @function
 * @param {Array} events - The  events to be displayed in the calendar.
 * @param {Object} config - The  calendar config
 * @returns {Array} - The formatted events.
 */
    prepare_events(events: any, config: any) {
        if (!config) {
            // if no config return events
            return events;
        }
        var configEvents = config['events'];
        events.forEach((event: { [x: string]: any; }) => {
            if (configEvents) {
                Object.keys(configEvents).forEach(key => {
                    if (event[configEvents[key]]) {
                        event[key] = event[configEvents[key]];
                    }
                });
            }
            if (!event['className']) {
                event['className'] = [];
            } else {
                event['className'] = [event['className']];
            }
            if (config['css']) {
                // there is a global css for the event object
                event['className'].push(config['css']);
            }
            if (config['form_calendars']) {
                // there is calendars setup, check for colors
                if (event['calendar_info'] && event['calendar_info']['color']) {
                    event['backgroundColor'] = event['calendar_info']['color'];
                    event['borderColor'] = event['calendar_info']['color'];
                    if (this.isColorLight(event['calendar_info']['color'])) {
                        event['textColor'] = "black";
                        event['borderColor'] = "black";
                    }
                }
            }
            event['className'].push(event['record_id']);
            if (!event['start']) {
                event['start'] = event['edit_time'];
            }
            if (event['end']) {
                let timePattern = /\d{2} \d{2}/;
                if (!timePattern.test(event['end'])) {
                    // there is no time add extra date because the end date is exclusive
                    let parsedDate = new Date(event['end']);
                    let updatedDate = addDays(parsedDate, 1);
                    event['end'] = format(updatedDate, 'yyyy-MM-dd');
                }
            }
        });
        console.log('calendar', events);
        return events;
    }

    /**
 * Check if the color is light
 * @function
 * @param {String} color - The color code
 * @returns {Boolean} - True if light color
 */
    isColorLight(color: String) {
        // Remove any whitespace and convert to lowercase for consistent formatting
        color = color.replace(/\s/g, '').toLowerCase();

        // Check if the color starts with '#' (hexadecimal notation)
        if (color.charAt(0) === '#') {
            // Extract the hex values for red, green, and blue
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);

            // Calculate the perceived brightness using the YIQ formula
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;

            // You can adjust this threshold to your preference (e.g., 128 for a mid-level threshold)
            return brightness > 128;
        }

        // Check if the color starts with 'rgb' (RGB notation)
        if (color.startsWith('rgb(')) {
            // Extract the RGB values using regular expressions
            const rgb = color.match(/\d+/g);
            if (rgb && rgb.length === 3) {
                const r = parseInt(rgb[0]);
                const g = parseInt(rgb[1]);
                const b = parseInt(rgb[2]);

                // Calculate the perceived brightness using the YIQ formula
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;

                // You can adjust this threshold to your preference (e.g., 128 for a mid-level threshold)
                return brightness > 128;
            }
        }

        // If the color format is not recognized, assume it's not light
        return false;
    }

    /**
     * @description Loop all children in the calendar and pick these which are form fields and set their value
     * @author Stefan Kodzhabashev
     * @date 08/11/2023
     * @param {Style[]} styles
     * @param {any} eventInfo
     * @memberof CalendarStyleComponent
     */
    propagateFields(styles: Style[], eventInfo: any) {
        styles.forEach((formField: Style) => {
            if (formField['children'] && formField['children'].length > 0) {
                this.propagateFields(formField['children'], eventInfo);
            }
            else if (this.selfhelpService.isFormField(formField)) {
                if (formField['name']['content'] == 'delete_record_id' || formField['name']['content'] == 'selected_record_id') {
                    // set the record id on these special fields
                    formField['last_value'] = eventInfo['record_id'];
                } else {
                    formField['last_value'] = eventInfo[formField['name']['content']];
                }
            }
        });
    }

}
