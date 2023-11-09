import { Component, Injector, NgZone, OnInit } from '@angular/core';
import { SelfHelp } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-basic-component',
    templateUrl: './basic-component.component.html',
    styleUrls: ['./basic-component.component.scss'],
})
export class BasicComponentComponent implements OnInit {

    public selfHelp!: SelfHelp;
    public url!: string;
    public selfHelpService: SelfhelpService;

    constructor(protected injector: Injector, protected zone: NgZone) {
        this.selfHelpService = this.injector.get(SelfhelpService);
        this.selfHelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfhelp) {
                    this.selfHelp = selfhelp;
                }
            });
        });
    }

    ngOnInit() {
        if (this.url) {
            this.selfHelpService.getPage(this.url);
        }
    }

    public async close() {
        this.selfHelpService.closeModal('cancel');
    }

    public getTitle(): string {
        return this.selfHelp.urls[this.url] && this.selfHelp.urls[this.url].title ? this.selfHelp.urls[this.url].title : '';
    }

}
