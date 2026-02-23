import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { SelfhelpService } from './selfhelp.service';
import { UtilsService } from './utils.service';
import { SelfHelp, TherapyChatState, TherapyChatMobileInfo } from '../selfhelpInterfaces';

@Injectable({
    providedIn: 'root'
})
export class TherapyChatNotificationService implements OnDestroy {
    private pollingTimer: any = null;
    private pollingInterval: number = 10000;
    private subscription: Subscription;
    private isPolling: boolean = false;

    private therapyChatState = new BehaviorSubject<TherapyChatState>({
        available: false,
        url: '',
        sectionId: null,
        unreadCount: 0,
        config: null
    });

    constructor(
        private selfhelpService: SelfhelpService,
        private utils: UtilsService
    ) {
        this.subscription = this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp) {
                this.processTherapyChatInfo(selfhelp);
            }
        });
    }

    observeTherapyChatState(): Observable<TherapyChatState> {
        return this.therapyChatState.asObservable();
    }

    getState(): TherapyChatState {
        return this.therapyChatState.value;
    }

    ngOnDestroy() {
        this.stopPolling();
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    /**
     * Process therapy_chat info from the page response (sent by Selfhelp.php on every mobile call).
     * This replaces the old content-scanning approach which only worked if the therapy chat
     * page had already been loaded.
     */
    private processTherapyChatInfo(selfhelp: SelfHelp) {
        const info: TherapyChatMobileInfo | undefined = selfhelp.therapyChatPageInfo;

        if (info && info.available) {
            const currentState = this.therapyChatState.value;
            const newState: TherapyChatState = {
                available: true,
                url: info.url || '',
                sectionId: info.section_id || null,
                unreadCount: info.unread_count || 0,
                config: {
                    icon: info.icon || 'fa-comments',
                    label: info.label || 'Chat',
                    position: info.position || 'bottom-right',
                    ai_enabled: true,
                    ai_label: 'AI Assistant',
                    therapist_label: 'Therapist'
                },
                mobileIcon: info.mobile_icon || 'chatbubbles',
                role: info.role || 'subject',
                enableFloating: info.enable_floating || false,
                position: info.position || 'bottom-right',
            };

            if (!this.statesEqual(currentState, newState)) {
                this.therapyChatState.next(newState);
                this.updateSelfhelpState(newState);
            }

            if (!this.isPolling && newState.url) {
                this.startPolling(newState.url, newState.sectionId);
            }
        } else if (!info && this.therapyChatState.value.available) {
            // Also try scanning loaded content as fallback
            const foundFromContent = this.scanContentFallback(selfhelp);
            if (!foundFromContent) {
                const resetState: TherapyChatState = {
                    available: false,
                    url: '',
                    sectionId: null,
                    unreadCount: 0,
                    config: null
                };
                this.therapyChatState.next(resetState);
                this.updateSelfhelpState(resetState);
                this.stopPolling();
            }
        }
    }

    /**
     * Fallback: scan loaded page content for therapyChat style.
     * Used only when the backend does not provide therapy_chat in the page response.
     */
    private scanContentFallback(selfhelp: SelfHelp): boolean {
        for (const url of Object.keys(selfhelp.urls)) {
            const page = selfhelp.urls[url];
            if (!page || !page.content) continue;

            const style = this.findTherapyChatStyle(page.content);
            if (style) {
                const config = style.chat_config || {
                    icon: 'fa-comments',
                    label: 'Chat',
                    position: 'bottom-right',
                    ai_enabled: true,
                    ai_label: 'AI Assistant',
                    therapist_label: 'Therapist'
                };

                const currentState = this.therapyChatState.value;
                const newState: TherapyChatState = {
                    available: true,
                    url: url,
                    sectionId: style.section_id || null,
                    unreadCount: currentState.unreadCount,
                    config: config
                };

                if (style.polling_interval) {
                    this.pollingInterval = style.polling_interval * 1000;
                }

                if (!this.statesEqual(currentState, newState)) {
                    this.therapyChatState.next(newState);
                    this.updateSelfhelpState(newState);
                }

                if (!this.isPolling && newState.sectionId) {
                    this.startPolling(url, newState.sectionId);
                }
                return true;
            }
        }
        return false;
    }

    private findTherapyChatStyle(content: any[]): any | null {
        if (!content || !Array.isArray(content)) return null;

        for (const style of content) {
            if (!style) continue;
            if (style.style_name === 'therapyChat') {
                return style;
            }
            if (style.children && style.children.length > 0) {
                const found = this.findTherapyChatStyle(style.children);
                if (found) return found;
            }
        }
        return null;
    }

    private startPolling(url: string, sectionId: number | null) {
        this.stopPolling();
        this.isPolling = true;
        this.utils.debugLog('TherapyChatNotification', `Polling every ${this.pollingInterval}ms`);
        this.scheduleNext(url, sectionId);
    }

    private stopPolling() {
        if (this.pollingTimer) {
            clearTimeout(this.pollingTimer);
            this.pollingTimer = null;
        }
        this.isPolling = false;
    }

    private scheduleNext(url: string, sectionId: number | null) {
        if (!this.isPolling) return;
        this.pollingTimer = setTimeout(() => this.poll(url, sectionId), this.pollingInterval);
    }

    private async poll(url: string, sectionId: number | null) {
        if (!this.isPolling) return;

        try {
            const params: any = { action: 'check_updates' };
            if (sectionId) params.section_id = sectionId;

            // Use POST (execServerRequest) so the server sees $_POST['mobile']
            // and routes through mobile_call → SectionPage → controller
            const res: any = await this.selfhelpService.execServerRequest(url, params);

            if (res && res.unread_count !== undefined) {
                const currentState = this.therapyChatState.value;
                if (currentState.unreadCount !== res.unread_count) {
                    const newState = { ...currentState, unreadCount: res.unread_count };
                    this.therapyChatState.next(newState);
                    this.updateSelfhelpState(newState);
                }
            }
        } catch (e) {
            this.utils.debugLog('TherapyChatNotification', 'Poll error: ' + e);
        }

        this.scheduleNext(url, sectionId);
    }

    private updateSelfhelpState(state: TherapyChatState) {
        const currSelfhelp = this.selfhelpService.selfhelp.value;
        currSelfhelp.therapyChatState = state;
    }

    private statesEqual(a: TherapyChatState, b: TherapyChatState): boolean {
        return a.available === b.available
            && a.url === b.url
            && a.sectionId === b.sectionId
            && a.unreadCount === b.unreadCount;
    }
}
