import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GlobalsService {
    public SH_SHEPHERD_PREFIX_NAME: string = 'shepherd_';

    constructor() { }
}
