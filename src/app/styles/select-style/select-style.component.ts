import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
declare const IconSelect: any;

@Component({
    selector: 'app-select-style',
    templateUrl: './select-style.component.html',
    styleUrls: ['./select-style.component.scss'],
})
export class SelectStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: SelectStyle;
    @Input() override parentForm!: FormGroup;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit() { }

    ngAfterViewInit(): void {
        if (this.getFieldContent('image_selector') == '1') {
            this.initImageSelector();
        }
    }

    private initImageSelector(): void {
        let iconSelect = new IconSelect('image_selector-' + this.getFieldContent('id'));
        let el = document.getElementById('image_selector-' + this.getFieldContent('id'));
        let fieldName = this.getFieldContent('name');
        let pForm = this.parentForm;
        if (el) {
            el.addEventListener('change', (e) => {
                const newValue: { [key: string]: any } = {};
                newValue[fieldName] = (e.target as HTMLInputElement).value;
                // Assuming 'pForm' is a reference to a form element or an object that can be used to set values
                pForm.setValue(newValue);
            });
        }

        var icons: any[] = [];
        this.style.items.forEach(value => {
            let text = value['text'];
            if (!this.selfhelp.isURL(text)) {
                text = this.selfhelp.getApiEndPointNative() + '/' + text;
            }
            if (value['value'] == this.style.last_value) {
                // push selected value first if exist, this is the default one
                icons.unshift({ 'iconFilePath': text, 'iconValue': value['value'] });
            } else {
                // fill the list if not already pushed as selected value
                icons.push({ 'iconFilePath': text, 'iconValue': value['value'] });
            }
        });
        iconSelect.refresh(icons);
    }

}
