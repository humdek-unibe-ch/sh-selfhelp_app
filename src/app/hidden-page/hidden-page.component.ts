import { Component, Input, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../components/basic-component/basic-component.component';
import { SelfhelpService } from '../services/selfhelp.service';

@Component({
    selector: 'app-hidden-page',
    templateUrl: './hidden-page.component.html',
    styleUrls: ['./hidden-page.component.scss'],
})
export class HiddenPageComponent extends BasicComponentComponent implements OnInit {
    @Input() url_param: string;

    constructor(selfhelpService: SelfhelpService) {
        super(selfhelpService);        
    }

    ngOnInit(){
        this.url = this.url_param;
        this.selfhelpService.getPage(this.url);
    }

}
