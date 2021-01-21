import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class UtilsService {

    private debugMode: boolean = true;

    constructor() { }

    public debugLog(text, obj: any):void {
        if (this.debugMode) {
            console.log('(debugLog)[' + moment().format('DD-MM-YYYY: H:mm:ss.SSS') + '] ' + text, obj);
        }
    }

    public getDebugMode(): boolean {
        return this.debugMode;
    }
}
