import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafePipeModule } from 'safe-pipe';
import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { DataTablesModule } from 'angular-datatables';
import { MenuRoutingModule } from './menu-routing.module';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        MenuRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SafePipeModule,
        PlotlyViaWindowModule,
        DataTablesModule
    ],
    declarations: [

    ]
})
export class MenuPageModule { }
