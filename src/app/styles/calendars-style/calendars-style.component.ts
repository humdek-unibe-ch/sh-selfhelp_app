import { Component, Input, OnInit } from '@angular/core';
import { CalendarsStyle } from 'src/app/selfhelpInterfaces';
import { ModalController } from '@ionic/angular';
import { ModalStyleComponent } from '../modal-style/modal-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { CalendarStyleComponent } from '../calendar-style/calendar-style.component';

@Component({
    selector: 'app-calendars-style',
    templateUrl: './calendars-style.component.html',
    styleUrls: ['./calendars-style.component.css']
})
export class CalendarsStyleComponent extends CalendarStyleComponent implements OnInit {
    @Input() override style!: CalendarsStyle;

    constructor(protected override modalController: ModalController, protected override selfhelpService: SelfhelpService) {
        super(modalController, selfhelpService);
    }

    override ngOnInit() {
        console.log("calendars", this.style);
    }

    async addNewCalendar() {
        this.initFormFields(this.style['style_add_calendar'].children);
        const modal = await this.modalController.create({
            component: ModalStyleComponent,
            componentProps: {
                style: this.style['style_add_calendar'],
                url: this.url,
                ionContent: this.ionContent
            },
            cssClass: '',
            keyboardClose: true,
            showBackdrop: true
        });
        // Add a callback when the modal is dismissed
        modal.onDidDismiss().then((data) => {
            if (data.role === 'submit') {
                // refresh the calendar
                this.selfhelpService.openUrl(this.url);
            }
        });
        return await modal.present();
    }

    editCalendar(recordId: any) {
        alert('Edit ' + recordId);
    }
}
