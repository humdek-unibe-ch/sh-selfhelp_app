import { Component, Injector, Input, NgZone, OnInit } from '@angular/core';
import { BasicComponentComponent } from '../basic-component/basic-component.component';

@Component({
    selector: 'app-modal-page',
    templateUrl: './modal-page.component.html',
    styleUrls: ['./modal-page.component.scss'],
})
export class ModalPageComponent extends BasicComponentComponent implements OnInit {
    @Input() url_param: string;

    constructor(injector: Injector,zone: NgZone) {
        super(injector, zone);           
    }

    async ngOnInit(){
        this.url = this.url_param;
        // this.selfhelpService.getPage(this.url);
    } 

    isMissing():boolean{
        if(this.selfhelp.urls[this.url].content.length > 0){
            if(String(this.selfhelp.urls[this.url].content[0]) == 'missing'){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }   

}
