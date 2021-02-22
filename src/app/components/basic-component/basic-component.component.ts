import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { SelfHelp } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-basic-component',
    templateUrl: './basic-component.component.html',
    styleUrls: ['./basic-component.component.scss'],
})
export class BasicComponentComponent implements OnInit {

    public selfhelp: SelfHelp;
    public url: string;
    protected selfhelpService: SelfhelpService;

    constructor(protected injector: Injector, protected zone: NgZone) {
        this.selfhelpService = this.injector.get(SelfhelpService);
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfhelp) {
                    this.selfhelp = selfhelp;
                }
            });
        });
    }

    ngOnInit() {
        if (this.url) {
            this.selfhelpService.getPage(this.url);
        }
    }

    public async close() {
        this.selfhelpService.closeModal();
    }

    public getTitle(): string {
        return this.selfhelp.urls[this.url] && this.selfhelp.urls[this.url].title ? this.selfhelp.urls[this.url].title : ''; 
    }

}
