import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsPage } from './tabs.page';
import { Router, RouterModule, Routes } from '@angular/router';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelp } from '../selfhelpInterfaces';

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
        FormsModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    declarations: [TabsPage]
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
            if(selectedTab === '' && selectedTab != firstTab){
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
