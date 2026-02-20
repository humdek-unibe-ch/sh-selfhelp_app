import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelfhelpService } from './selfhelp.service';
import { UtilsService } from './utils.service';
import { SelfHelp } from '../selfhelpInterfaces';

@Injectable({
    providedIn: 'root'
})
export class EventListenerService implements OnDestroy {
    private pollingTimer: any = null;
    private isPolling: boolean = false;
    private currentUrl: string = '';
    private intervalSeconds: number = 5;
    private subscription: Subscription;

    constructor(
        private selfhelpService: SelfhelpService,
        private utils: UtilsService
    ) {
        this.subscription = this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.handlePageChange(selfhelp);
            }
        });
    }

    private handlePageChange(selfhelp: SelfHelp) {
        if (selfhelp.enable_event_listener && selfhelp.current_url) {
            const interval = selfhelp.event_listener_interval || 5;
            if (this.currentUrl !== selfhelp.current_url || this.intervalSeconds !== interval || !this.isPolling) {
                this.startPolling(selfhelp.current_url, interval);
            }
        } else {
            this.stopPolling();
        }
    }

    private startPolling(url: string, intervalSeconds: number) {
        this.stopPolling();
        this.currentUrl = url;
        this.intervalSeconds = Math.max(1, intervalSeconds);
        this.isPolling = true;
        this.utils.debugLog('EventListener', `Polling every ${this.intervalSeconds}s for ${url}`);
        this.scheduleNext();
    }

    private stopPolling() {
        if (this.pollingTimer) {
            clearTimeout(this.pollingTimer);
            this.pollingTimer = null;
        }
        this.isPolling = false;
    }

    ngOnDestroy() {
        this.stopPolling();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private scheduleNext() {
        if (!this.isPolling) return;
        this.pollingTimer = setTimeout(() => this.poll(), this.intervalSeconds * 1000);
    }

    private async poll() {
        if (!this.isPolling) return;

        try {
            const res: any = await this.selfhelpService.execServerRequest('/request/AjaxRefreshEvents/check', {});
            const events = res?.data?.events || res?.events || [];
            const refreshSections = res?.data?.refresh_sections || res?.refresh_sections || [];

            if (events.length > 0 || refreshSections.length > 0) {
                this.utils.debugLog('EventListener', `${events.length} events received, refreshing`);
                await this.selfhelpService.getPage(this.currentUrl);
            }
        } catch (e) {
            this.utils.debugLog('EventListener', 'Poll error: ' + e);
        }

        this.scheduleNext();
    }
}
