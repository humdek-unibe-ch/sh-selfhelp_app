import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { FormBuilder } from '@angular/forms';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { GlobalsService } from 'src/app/services/globals.service';
import { TwoFactorAuthStyle } from 'src/app/selfhelpInterfaces';

@Component({
    selector: 'app-two-factor-auth-style',
    templateUrl: './two-factor-auth-style.component.html',
    styleUrls: ['./two-factor-auth-style.component.scss'],
})
export class TwoFactorAuthStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: TwoFactorAuthStyle;

    constructor(private formBuilder: FormBuilder, private selfhelpService: SelfhelpService, private globals: GlobalsService) {
        super();
    }

    override ngOnInit() { }

}
