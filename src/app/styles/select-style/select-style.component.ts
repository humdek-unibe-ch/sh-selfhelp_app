import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { StringUtils } from 'turbocommons-ts';
declare const IconSelect: any;

@Component({
    selector: 'app-select-style',
    templateUrl: './select-style.component.html',
    styleUrls: ['./select-style.component.scss'],
})
export class SelectStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: SelectStyle;
    @Input() parentForm: FormGroup;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    ngOnInit() {
        console.log('style', this.style)
    }

    ngAfterViewInit(): void {
        if(this.getFieldContent('image_selector') == '1'){
            this.initImageSelector();
        }
    }

    private initImageSelector(): void {
        let iconSelect = new IconSelect('image_selector-' + this.getFieldContent('id'));
        console.log(this.style, iconSelect);
        let el = document.getElementById('image_selector-' + this.getFieldContent('id'));
        let fieldName = this.getFieldContent('name');
        let pForm = this.parentForm;
        $(el).on('changed', function (e) {
            let newValue = {};
            newValue[fieldName] = iconSelect.getSelectedValue();
            pForm.setValue(newValue);
        });

        var icons = [];
        this.style.items.forEach(value => {
            let text = value['text'];
            if (!StringUtils.isUrl(text)) {
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
        console.log(icons);
        iconSelect.refresh(icons);
    }

}
