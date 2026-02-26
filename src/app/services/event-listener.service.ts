import { Injectable, NgZone, OnDestroy } from '@angular/core';
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
    private readonly PAGE_REFRESH_TIMEOUT_MS = 30000;
    private consecutiveErrors: number = 0;
    private readonly MAX_CONSECUTIVE_ERRORS = 5;
    private formSubmitTimestamp: number = 0;
    private readonly FORM_SUBMIT_SAFETY_TIMEOUT_MS = 120000;

    constructor(
        private selfhelpService: SelfhelpService,
        private utils: UtilsService,
        private zone: NgZone
    ) {
        this.subscription = this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.handlePageChange(selfhelp);
            }
        });

        this.selfhelpService.formSubmitting.subscribe((submitting: boolean) => {
            if (submitting) {
                this.formSubmitTimestamp = Date.now();
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
            if (this.isPolling) {
                this.utils.debugLog('EventListener', `Stopping polling (enable_event_listener=${selfhelp.enable_event_listener}, url=${selfhelp.current_url})`);
            }
            this.stopPolling();
        }
    }

    private startPolling(url: string, intervalSeconds: number) {
        this.stopPolling();
        this.currentUrl = url;
        this.intervalSeconds = Math.max(1, intervalSeconds);
        this.isPolling = true;
        this.consecutiveErrors = 0;
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

    /**
     * Extract events and refresh_sections from the server response.
     * The response format differs depending on the path:
     * - Via mobile_call → AjaxRequest wraps it: {success: true, data: {events: [...], refresh_sections: [...]}}
     * - Direct: {events: [...], refresh_sections: [...]}
     */
    private extractEventsFromResponse(res: any): { events: any[]; refreshSections: any[]; accessDenied: boolean } {
        if (!res) {
            return { events: [], refreshSections: [], accessDenied: false };
        }

        if (res.success === false) {
            const isAccessDenied = typeof res.data === 'string' && res.data.toLowerCase().includes('access denied');
            return { events: [], refreshSections: [], accessDenied: isAccessDenied };
        }

        const data = res.data && typeof res.data === 'object' ? res.data : res;
        const events = data?.events || [];
        const refreshSections = data?.refresh_sections || [];

        return { events, refreshSections, accessDenied: false };
    }

    private async poll() {
        if (!this.isPolling) return;

        this.checkFormSubmitSafetyTimeout();

        try {
            const res: any = await this.selfhelpService.execServerRequest('/request/AjaxRefreshEvents/check', {});
            const { events, refreshSections, accessDenied } = this.extractEventsFromResponse(res);

            if (accessDenied) {
                this.consecutiveErrors++;
                this.utils.debugLog('EventListener', `Access denied (attempt ${this.consecutiveErrors}/${this.MAX_CONSECUTIVE_ERRORS})`);
                if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
                    this.utils.debugLog('EventListener', 'Too many access denied errors, stopping polling');
                    this.clearFormSubmitting();
                    this.stopPolling();
                    return;
                }
            } else {
                this.consecutiveErrors = 0;
            }

            if (events.length > 0 || refreshSections.length > 0) {
                this.utils.debugLog('EventListener', `${events.length} events, ${refreshSections.length} sections to refresh`);
                try {
                    await this.getPageWithTimeout(this.currentUrl);
                } catch (pageErr) {
                    this.utils.debugLog('EventListener', 'Page refresh failed: ' + pageErr);
                }
                this.clearFormSubmitting();
            }
        } catch (e) {
            this.consecutiveErrors++;
            this.utils.debugLog('EventListener', 'Poll error: ' + e);
            if (this.consecutiveErrors >= this.MAX_CONSECUTIVE_ERRORS) {
                this.utils.debugLog('EventListener', 'Too many consecutive poll errors, clearing form submitting state');
                this.clearFormSubmitting();
            }
        } finally {
            this.scheduleNext();
        }
    }

    private clearFormSubmitting() {
        this.zone.run(() => {
            this.selfhelpService.formSubmitting.next(false);
        });
    }

    /**
     * Safety net: if formSubmitting has been true for too long, clear it.
     * Prevents the UI from being stuck in a loading state indefinitely.
     */
    private checkFormSubmitSafetyTimeout() {
        if (this.selfhelpService.formSubmitting.value && this.formSubmitTimestamp > 0) {
            const elapsed = Date.now() - this.formSubmitTimestamp;
            if (elapsed > this.FORM_SUBMIT_SAFETY_TIMEOUT_MS) {
                this.utils.debugLog('EventListener', `Form submit safety timeout (${elapsed}ms), clearing loading state`);
                this.clearFormSubmitting();
                this.formSubmitTimestamp = 0;
            }
        }
    }

    private getPageWithTimeout(url: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Page refresh timed out'));
            }, this.PAGE_REFRESH_TIMEOUT_MS);

            this.selfhelpService.getPage(url)
                .then(() => {
                    clearTimeout(timer);
                    resolve();
                })
                .catch((err) => {
                    clearTimeout(timer);
                    reject(err);
                });
        });
    }
}
