import { Component, Injector, Input, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-language-select',
    templateUrl: './language-select.component.html',
    styleUrls: ['./language-select.component.scss'],
})
export class LanguageSelectComponent extends BasicComponentComponent implements OnInit {
    @Input() override url!: string;

    constructor(injector: Injector, zone: NgZone) {
        super(injector, zone);
    }

    override ngOnInit() { }

    refreshAfterLanguageChange() {
        this.selfHelpService.loadLanguage();
        this.selfHelpService.getPage(this.url);
    }

}
