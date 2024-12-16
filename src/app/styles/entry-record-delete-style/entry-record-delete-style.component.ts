import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { EntryRecordDeleteStyle } from 'src/app/selfhelpInterfaces';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-entry-record-delete-style',
    templateUrl: './entry-record-delete-style.component.html',
    styleUrls: ['./entry-record-delete-style.component.scss'],
})
export class EntryRecordDeleteStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: EntryRecordDeleteStyle;
    public form!: FormGroup;

    constructor(protected selfhelpService: SelfhelpService, private fb: FormBuilder) {
        super();
    }

    override ngOnInit() {
        this.form = this.fb.group({
            delete_record_id: [this.style.delete_record_id, Validators.required],  // Adding delete_record_id form control
          });
    }

    public formSubmitClick(){
        const formValues = this.form.value;  // Get form values
        if (this.getFieldContent('confirmation_title') != '') {
            // check for confirmation first
            this.selfhelpService.presentAlertConfirm({
                msg: this.getFieldContent('confirmation_message'),
                header: this.getFieldContent('confirmation_title'),
                confirmLabel: this.getFieldContent('confirmation_continue'),
                cancelLabel: this.getFieldContent('label_cancel'),
                callback: () => {
                    this.submitForm(formValues);
                }
            });
        } else {
            this.submitForm(formValues);
        }
    }

    public async submitForm(value: { [key: string]: any; }) {
        const res = await this.selfhelpService.submitForm(this.url, value);
        if (res && this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal('submit');
        }
        if (this.getFieldContent('redirect_at_end') != '') {
            this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
        }
    }

}
