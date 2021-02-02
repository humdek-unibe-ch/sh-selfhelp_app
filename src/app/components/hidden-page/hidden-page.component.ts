import { Component, Injector, Input, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';
import { SelfHelpPageRequest } from './../../selfhelpInterfaces';

@Component({
    selector: 'app-hidden-page',
    templateUrl: './hidden-page.component.html',
    styleUrls: ['./hidden-page.component.scss'],
})
export class HiddenPageComponent extends BasicComponentComponent implements OnInit {
    @Input() url_param: string;

    constructor(injector: Injector) {
        super(injector);        
    }

    async ngOnInit(){
        this.url = this.url_param;
        this.selfhelpService.getPage(this.url);
    }    

}
