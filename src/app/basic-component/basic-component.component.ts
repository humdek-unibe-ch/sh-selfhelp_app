import { Component, OnInit } from '@angular/core';
import { SelfHelp } from '../selfhelpInterfaces';
import { SelfhelpService } from '../services/selfhelp.service';

@Component({
    selector: 'app-basic-component',
    templateUrl: './basic-component.component.html',
    styleUrls: ['./basic-component.component.scss'],
})
export class BasicComponentComponent implements OnInit {

    public selfhelp: SelfHelp;
    public url: string;

    constructor(protected selfhelpService: SelfhelpService) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.selfhelp = selfhelp;
            }
        });
    }

    ngOnInit() {
        this.selfhelpService.getPage(this.url);
    }

    public async close() {
        this.selfhelpService.closeModal();
    }

}
