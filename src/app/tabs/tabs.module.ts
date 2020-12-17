import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabsPage } from './tabs.page';
import { Router, RouterModule, Routes } from '@angular/router';
import { SelfhelpService } from '../services/selfhelp.service';
import { SelfHelpPage } from '../selfhelpInterfaces';

const routes: Routes = [
    {
        path: '',
        component: TabsPage,
        children: [
            {
                path: 'default',
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

    constructor(private selfhelp: SelfhelpService, private router: Router) {
        this.selfhelp.observePage().subscribe((page: SelfHelpPage) => {
            if (page) {
                this.adjustRoutes(page);
            }
        });
    }

    /**
     * @description Adjust routes if there is difference
     * @author Stefan Kodzhabashev
     * @date 2020-12-11
     * @private
     * @param {SelfHelpPage} page
     * @memberof TabsPageModule
     */
    private adjustRoutes(page: SelfHelpPage) {
        let newRoutes = routes;
        newRoutes[0].children = [];
        let selectedTab = '';
        let firstTab = '';
        page.navigation.forEach(nav => {
            if (nav.is_active) {
                selectedTab = nav.keyword;
            }
            if (firstTab === '') {
                selectedTab = firstTab;
            }
            newRoutes[0].children.push(
                {
                    path: nav.keyword,
                    loadChildren: () => import('../tab/tab.module').then(m => m.TabPageModule)
                }
            );
            newRoutes[1].redirectTo = '/' + (selectedTab == '' ? firstTab : selectedTab);

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
        if(route1[0].redirectTo != route2[0].redirectTo){
            return true;
        }
        if(!route1[0].children || !route2[0].children){
            return true;
        }
        for (let i = 0; i < route1[0].children.length; i++){
            const element = route1[0].children[i];
            if(route1[0].children.length > i){
                if(route1[0].children[i].path != route2[0].children[i].path){
                    // different path
                    return true;
                }
            }else{
                //different number of routes
                return true;
            }
            
        }
        // no difference
        return false;
    }


}
