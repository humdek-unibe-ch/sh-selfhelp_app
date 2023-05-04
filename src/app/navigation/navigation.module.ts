import { IonicModule } from '@ionic/angular';
import { LOCALE_ID, NgModule, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationPage } from './navigation.page';
import { Router, RouterModule, Routes } from '@angular/router';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelp } from '../selfhelpInterfaces';
import { SafePipeModule } from 'safe-pipe';
import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { DataTablesModule } from 'angular-datatables';
import { LoginComponent } from '../components/login/login.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicStyleComponent } from '../styles/basic-style/basic-style.component';
import { BasicComponentComponent } from '../components/basic-component/basic-component.component';
import { ModalPageComponent } from '../components/modal-page/modal-page.component';
import { CardStyleComponent } from '../styles/card-style/card-style.component';
import { MarkdownStyleComponent } from '../styles/markdown-style/markdown-style.component';
import { ContainerStyleComponent } from '../styles/container-style/container-style.component';
import { FormUserInputStyleComponent } from '../styles/form-user-input-style/form-user-input-style.component';
import { ConditionalContainerStyleComponent } from '../styles/conditional-container-style/conditional-container-style.component';
import { SubMenuComponent } from './sub-menu/sub-menu.component';
import { InputStyleComponent } from '../styles/input-style/input-style.component';
import { RadioStyleComponent } from '../styles/radio-style/radio-style.component';
import { SelectStyleComponent } from '../styles/select-style/select-style.component';
import { TextareaStyleComponent } from '../styles/textarea-style/textarea-style.component';
import { QualtricsSurveyStyleComponent } from '../styles/qualtrics-survey-style/qualtrics-survey-style.component';
import { DivStyleComponent } from '../styles/div-style/div-style.component';
import { ImageStyleComponent } from '../styles/image-style/image-style.component';
import { VideoStyleComponent } from '../styles/video-style/video-style.component';
import { AlertStyleComponent } from '../styles/alert-style/alert-style.component';
import { PlaintextStyleComponent } from '../styles/plaintext-style/plaintext-style.component';
import { MarkdownInlineStyleComponent } from '../styles/markdown-inline-style/markdown-inline-style.component';
import { HeadingStyleComponent } from '../styles/heading-style/heading-style.component';
import { RawTextStyleComponent } from '../styles/raw-text-style/raw-text-style.component';
import { AudioStyleComponent } from '../styles/audio-style/audio-style.component';
import { FigureStyleComponent } from '../styles/figure-style/figure-style.component';
import { ProgressBarStyleComponent } from '../styles/progress-bar-style/progress-bar-style.component';
import { CarouselStyleComponent } from '../styles/carousel-style/carousel-style.component';
import { JumbotronStyleComponent } from '../styles/jumbotron-style/jumbotron-style.component';
import { TabsStyleComponent } from '../styles/tabs-style/tabs-style.component';
import { GraphStyleComponent } from '../styles/graph-style/graph-style.component';
import { ShowUserInputStyleComponent } from '../styles/show-user-input-style/show-user-input-style.component';
import { ButtonStyleComponent } from '../styles/button-style/button-style.component';
import { LinkStyleComponent } from '../styles/link-style/link-style.component';
import { AccordionListStyleComponent } from '../styles/accordion-list-style/accordion-list-style.component';
import { NestedListStyleComponent } from '../styles/nested-list-style/nested-list-style.component';
import { SortableListComponent } from '../styles/sortable-list/sortable-list.component';
import { NavigationContainerStyleComponent } from '../styles/navigation-container-style/navigation-container-style.component';
import { JsonStyleComponent } from '../styles/json-style/json-style.component';
import { QuizStyleComponent } from '../styles/quiz-style/quiz-style.component';
import { LoginStyleComponent } from '../styles/login-style/login-style.component';
import { RegisterStyleComponen } from '../styles/register-style/register-style.component';
import { ProfileStyleComponent } from '../styles/profile-style/profile-style.component';
import { FormStyleComponent } from '../styles/form-style/form-style.component';
import { MenuPage } from './menu/menu.page';
import { ResetPasswordStyleComponent } from '../styles/reset-password-style/reset-password-style.component';
import { ValidateStyleComponent } from '../styles/validate-style/validate-style.component';
import { MessageBoardStyleComponent } from '../styles/message-board-style/message-board-style.component';
import { SubmitCommentComponent } from '../styles/message-board-style/submit-comment/submit-comment.component';
import { EntryListComponent } from '../styles/entry-list/entry-list.component';
import { CalendarStyleComponent } from '../styles/calendar-style/calendar-style.component';
import { NgCalendarModule } from 'ionic2-calendar';
import { RecordMediaStyleComponent } from '../styles/record-media-style/record-media-style.component';
import { LanguageSelectComponent } from '../components/language-select/language-select.component';
import { AppVersionComponent } from '../components/app-version/app-version.component';
import { TranslateModule } from '@ngx-translate/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfViewerComponent } from '../components/pdf-viewer/pdf-viewer.component';
import { SurveyJSStyleComponent } from '../styles/survey-js-style/survey-js-style.component';
import { SurveyModule } from 'survey-angular-ui';

const routes: Routes = [
    {
        path: '',
        component: NavigationPage,
        children: [
            {
                path: '/',
                // component: MenuComponent
                loadChildren: () => import('./menu/menu.module').then(m => m.MenuPageModule)
            },
            {
                path: '/',
                redirectTo: '/',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/',
        pathMatch: 'full'
    }
];


@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        ReactiveFormsModule,
        SafePipeModule,
        PlotlyViaWindowModule,
        DataTablesModule,
        NgCalendarModule,
        TranslateModule,
        PdfViewerModule,
        SurveyModule
    ],
    exports: [
        RouterModule
    ],
    declarations: [
        NavigationPage,
        MenuPage,
        LoginComponent,
        ProfileComponent,
        BasicComponentComponent,
        ModalPageComponent,
        BasicStyleComponent,
        BasicStyleComponent,
        CardStyleComponent,
        MarkdownStyleComponent,
        ContainerStyleComponent,
        FormUserInputStyleComponent,
        ConditionalContainerStyleComponent,
        SubMenuComponent,
        InputStyleComponent,
        RadioStyleComponent,
        SelectStyleComponent,
        TextareaStyleComponent,
        QualtricsSurveyStyleComponent,
        DivStyleComponent,
        ImageStyleComponent,
        VideoStyleComponent,
        AlertStyleComponent,
        PlaintextStyleComponent,
        MarkdownInlineStyleComponent,
        HeadingStyleComponent,
        RawTextStyleComponent,
        AudioStyleComponent,
        FigureStyleComponent,
        ProgressBarStyleComponent,
        CarouselStyleComponent,
        JumbotronStyleComponent,
        TabsStyleComponent,
        GraphStyleComponent,
        ShowUserInputStyleComponent,
        ButtonStyleComponent,
        LinkStyleComponent,
        AccordionListStyleComponent,
        NestedListStyleComponent,
        SortableListComponent,
        NavigationContainerStyleComponent,
        JsonStyleComponent,
        QuizStyleComponent,
        LoginStyleComponent,
        RegisterStyleComponen,
        ProfileStyleComponent,
        FormStyleComponent,
        ResetPasswordStyleComponent,
        ValidateStyleComponent,
        MessageBoardStyleComponent,
        SubmitCommentComponent,
        EntryListComponent,
        CalendarStyleComponent,
        RecordMediaStyleComponent,
        LanguageSelectComponent,
        AppVersionComponent,
        PdfViewerComponent,
        SurveyJSStyleComponent
    ]
})
export class NavigationPageModule {

    constructor(private selfhelpService: SelfhelpService, private router: Router, private zone: NgZone) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            this.zone.run(() => {
                if (selfhelp && selfhelp.navigation && selfhelp.navigation.length > 0) {
                    this.adjustRoutes(selfhelp);
                }
            });
        });
    }

    /**
     * @description Adjust routes if there is difference
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {SelfHelp} selfhelp
     * @memberof NavigationPageModule
     */
    private adjustRoutes(selfhelp: SelfHelp) {
        let newRoutes = routes;
        newRoutes[0].children = [];
        let selectedTab = '';
        let firstTab = '';
        selfhelp.navigation.forEach(nav => {
            if (nav.is_active) {
                selectedTab = this.selfhelpService.getUrl(nav).replace('/', '');
            }
            if (firstTab === '') {
                firstTab = this.selfhelpService.getUrl(nav).replace('/', '');
            }
            newRoutes[0].children.push(
                {
                    path: this.selfhelpService.getUrl(nav).replace('/', ''),
                    // component: MenuComponent
                    loadChildren: () => import('./menu/menu.module').then(m => m.MenuPageModule)
                }
            );
            if (selectedTab === '' && selectedTab != firstTab) {
                selectedTab = firstTab;
            }
            newRoutes[1].redirectTo = '/' + selectedTab;

        });
        const currConfig = this.router.config;

        if (this.areRoutesDifferent(currConfig, newRoutes)) {
            this.router.resetConfig(newRoutes);
            this.router.navigate(['/' + selectedTab]);
        }
    }

    /**
     * @description Check if there is a difference in the router paths
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {Routes} route1
     * @param {Routes} route2
     * @returns {boolean}
     * @memberof NavigationPageModule
     */
    private areRoutesDifferent(route1: Routes, route2: Routes): boolean {
        try {
            if (route1[0].redirectTo != route2[0].redirectTo) {
                return true;
            }
            if (!route1[0].children || !route2[0].children) {
                return true;
            }
            for (let i = 0; i < route1[0].children.length; i++) {
                const element = route1[0].children[i];
                if (route1[0].children.length > i) {
                    if (route1[0].children[i].path != route2[0].children[i].path) {
                        // different path
                        return true;
                    }
                } else {
                    //different number of routes
                    return true;
                }

            }
            // no difference
            return false;
        } catch (er) {
            console.log(er);
            return true;
        }
    }


}
