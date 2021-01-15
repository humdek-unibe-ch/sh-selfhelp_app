import { Component, OnInit } from '@angular/core';
import { SelfHelp } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
    public selfhelp: SelfHelp;

    constructor(private selfhelpService: SelfhelpService) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.selfhelp = selfhelp;
            }
        });
    }

    ngOnInit() { 
        this.selfhelpService.getPage('/login');
    }

    public async close() {
        this.selfhelpService.closeModal();
    }

}
