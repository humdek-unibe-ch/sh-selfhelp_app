import { Injectable } from '@angular/core';
import { LocalSelfhelp } from '../selfhelpInterfaces';

@Injectable({
    providedIn: 'root'
})
export class GlobalsService {
    public SH_SHEPHERD_PREFIX_NAME: string = 'shepherd_';
    public SH_LOCAL_SELFHELP: LocalSelfhelp = 'selfhelp';
    public SH_SELFHELP_SERVER: string = 'server';
    public SH_API_LOGIN = '/login';
    public SH_API_RESET = '/reset';
    public SH_API_HOME = '/home';

    constructor() { }
}
