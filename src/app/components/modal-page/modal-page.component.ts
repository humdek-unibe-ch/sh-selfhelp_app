import { Component, Injector, Input, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-modal-page',
    templateUrl: './modal-page.component.html',
    styleUrls: ['./modal-page.component.scss'],
})
export class ModalPageComponent extends BasicComponentComponent implements OnInit {
    @Input() url_param: string;

    constructor(injector: Injector) {
        super(injector);              
    }

    async ngOnInit(){
        this.url = this.url_param;
        this.selfhelpService.getPage(this.url);
        console.log(this.url, this.selfhelp.current_url, this.selfhelp.urls[this.url]); 
    }    

}
