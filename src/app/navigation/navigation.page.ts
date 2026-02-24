import { AfterViewInit, Component, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { IonTabs, ModalController } from '@ionic/angular';
import { SelfHelp, TherapyChatState } from '../selfhelpInterfaces';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelpNavigation } from 'src/app/selfhelpInterfaces';
import { EventListenerService } from '../services/event-listener.service';
import { TherapyChatNotificationService } from '../services/therapy-chat-notification.service';
import { TherapyChatModalComponent } from '../components/therapy-chat-modal/therapy-chat-modal.component';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-navigation',
    templateUrl: 'navigation.page.html',
    styleUrls: ['navigation.page.scss']
})
export class NavigationPage implements AfterViewInit, OnDestroy {
    public selfHelp?: SelfHelp;
    public init = false;
    private external_css = 'external_css';
    private selected_menu_url = '';
    @ViewChild('navigation') tabRef?: IonTabs;

    public therapyChatState: TherapyChatState = {
        available: false,
        url: '',
        sectionId: null,
        unreadCount: 0,
        config: null
    };
    private therapyChatSub?: Subscription;
    public isTherapyChatActive = false;

    constructor(
        public selfHelpService: SelfhelpService,
        private zone: NgZone,
        private eventListenerService: EventListenerService,
        private therapyChatNotification: TherapyChatNotificationService,
        private modalController: ModalController
    ) {
        this.selfHelpService.observeSelfhelp().subscribe((selfHelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfHelp) {
                    this.selfHelp = selfHelp;
                    if (!this.selfHelp.selectedMenu && selfHelp.navigation.length > 0) {
                        this.init = true;
                        this.setTab(this.selfHelp.navigation[0]);
                    } else if (this.selfHelp.selectedMenu && !this.init) {
                        this.init = true;
                        this.selectMenu(this.selfHelp.selectedMenu);
                    }
                    let ext_css = document.getElementById(this.external_css);
                    if (ext_css) {
                        ext_css.innerHTML = '';
                        ext_css.appendChild(document.createTextNode(selfHelp.external_css));
                    } else {
                        const head = document.getElementsByTagName('head')[0];
                        const style = document.createElement('style');
                        style.id = this.external_css;
                        style.type = 'text/css';
                        style.appendChild(document.createTextNode(selfHelp.external_css));
                        head.appendChild(style);
                    }
                }
            });
        });

        this.therapyChatSub = this.therapyChatNotification.observeTherapyChatState().subscribe(state => {
            this.zone.run(() => {
                this.therapyChatState = state;
            });
        });
    }

    ngOnInit(): void { }

    ngAfterViewInit() {
        if (this.selfHelpService.selfhelp.value.selectedMenu) {
            this.selectMenu(this.selfHelpService.selfhelp.value.selectedMenu);
        }
    }

    ngOnDestroy() {
        if (this.therapyChatSub) {
            this.therapyChatSub.unsubscribe();
        }
    }

    getTabName(nav: SelfHelpNavigation): string {
        return this.selfHelpService.getUrl(nav).replace('/', '');
    }

    async setTab(nav: SelfHelpNavigation) {
        this.isTherapyChatActive = false;
        const res = await this.selfHelpService.getPage(this.selfHelpService.getUrl(nav));
        this.selectMenu(nav);
    }

    selectMenu(nav: SelfHelpNavigation): void {
        if (this.selfHelp) {
            this.selfHelp.selectedMenu = nav;
            this.selfHelpService.setSelectedMenu(nav);
            if (this.tabRef) {
                this.tabRef.select(this.getTabName(this.selfHelp.selectedMenu));
            }
        }
    }

    public getIcon(nav: SelfHelpNavigation): string {
        return this.selfHelpService.getIcon(nav.icon);
    }

    public getTherapyChatIcon(): string {
        if (this.therapyChatState.mobileIcon) {
            return this.therapyChatState.mobileIcon;
        }
        if (this.therapyChatState.config?.icon) {
            const icon = this.therapyChatState.config.icon;
            const mapped = this.selfHelpService.getIcon(icon);
            if (mapped) return mapped;
            const faToIonic: Record<string, string> = {
                'fa-comments': 'chatbubbles',
                'fa-comment': 'chatbubble',
                'fa-comment-dots': 'chatbubble-ellipses',
                'fa-comment-medical': 'medkit',
                'fa-envelope': 'mail',
                'fa-bell': 'notifications',
                'fa-user-md': 'person',
                'fa-heart': 'heart',
                'fa-shield': 'shield',
            };
            return faToIonic[icon] || 'chatbubbles';
        }
        return 'chatbubbles';
    }

    public getTherapyChatLabel(): string {
        return this.therapyChatState.config?.label || 'Chat';
    }

    public getFabVertical(): string {
        const pos = this.therapyChatState.position || 'bottom-right';
        return pos.startsWith('top') ? 'top' : 'bottom';
    }

    public getFabHorizontal(): string {
        const pos = this.therapyChatState.position || 'bottom-right';
        return pos.endsWith('left') ? 'start' : 'end';
    }

    public async navigateToTherapyChat() {
        if (!this.therapyChatState.url) return;
        this.isTherapyChatActive = true;
        const url = this.therapyChatState.url;
        await this.selfHelpService.getPage(url);
        const syntheticNav: SelfHelpNavigation = {
            id_navigation_section: null,
            title: this.getTherapyChatLabel(),
            keyword: url.replace(/^\//, ''),
            url: url,
            icon: this.getTherapyChatIcon(),
            is_active: true,
            children: []
        };
        if (this.selfHelp) {
            this.selfHelp.selectedMenu = syntheticNav;
            this.selfHelpService.setSelectedMenu(syntheticNav);
        }
    }

    public async openTherapyChatModal() {
        if (!this.therapyChatState.url) return;
        const url = this.therapyChatState.url;
        await this.selfHelpService.getPage(url);
        const modal = await this.modalController.create({
            component: TherapyChatModalComponent,
            componentProps: {
                url_param: url,
                title: this.getTherapyChatLabel(),
                icon: this.getTherapyChatIcon(),
                unreadCount: this.therapyChatState.unreadCount
            },
            cssClass: 'therapy-chat-modal-fullscreen'
        });
        await modal.present();
    }
}
