import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsPage } from './tabs.page';
import { Router, RouterModule, Routes } from '@angular/router';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelp } from '../selfhelpInterfaces';
import { MenuComponent } from '../menu/menu/menu.component';
import { SubMenuComponent } from '../menu/sub-menu/sub-menu.component';
import { BasicStyleComponent } from '../styles/basic-style/basic-style.component';
import { CardStyleComponent } from '../styles/card-style/card-style.component';
import { MarkdownStyleComponent } from '../styles/markdown-style/markdown-style.component';
import { ContainerStyleComponent } from '../styles/container-style/container-style.component';
import { FormUserInputStyleComponent } from '../styles/form-user-input-style/form-user-input-style.component';
import { ConditionalContainerStyleComponent } from '../styles/conditional-container-style/conditional-container-style.component';
import { InputStyleComponent } from '../styles/input-style/input-style.component';
import { RadioStyleComponent } from '../styles/radio-style/radio-style.component';
import { SelectStyleComponent } from '../styles/select-style/select-style.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextareaStyleComponent } from '../styles/textarea-style/textarea-style.component';
import { QualtricsSurveyStyleComponent } from '../qualtrics-survey-style/qualtrics-survey-style.component';
import { SafePipeModule } from 'safe-pipe';
import { DivStyleComponent } from '../styles/div-style/div-style.component';
import { ImageStyleComponent } from '../styles/image-style/image-style.component';
import { VideoStyleComponent } from '../styles/video-style/video-style.component';
import { AlertStyleComponent } from '../styles/alert-style/alert-style.component';
import { PlaintextStyleComponent } from '../styles/plaintext-style/plaintext-style.component';
import { MarkdownInlineStyleComponent } from '../styles/markdown-inline-style/markdown-inline-style.component';

const routes: Routes = [
    {
        path: '',
        component: TabsPage,
        children: [
            {
                path: '/',
                loadChildren: () => import('../tab/tab.module').then(m => m.TabPageModule)
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
        SafePipeModule
    ],
    exports: [RouterModule],
    declarations: [
        TabsPage,
        MenuComponent,
        SubMenuComponent,
        BasicStyleComponent,
        CardStyleComponent,        
        MarkdownStyleComponent,
        ContainerStyleComponent,
        FormUserInputStyleComponent,
        ConditionalContainerStyleComponent,
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
        MarkdownInlineStyleComponent
    ]
})
export class TabsPageModule {

    constructor(private selfhelpService: SelfhelpService, private router: Router) {
        this.selfhelpService.observeSelfhelp().subscribe((selfhelp: SelfHelp) => {
            if (selfhelp.navigation.length > 0) {
                this.adjustRoutes(selfhelp);
            }
        });
    }

    /**
     * @description Adjust routes if there is difference
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {SelfHelp} selfhelp
     * @memberof TabsPageModule
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
                    loadChildren: () => import('../tab/tab.module').then(m => m.TabPageModule)
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
     * @memberof TabsPageModule
     */
    private areRoutesDifferent(route1: Routes, route2: Routes): boolean {
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
    }


}
