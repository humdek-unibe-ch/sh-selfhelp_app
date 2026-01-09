import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafePipeModule } from 'safe-pipe';
import { DataTablesModule } from 'angular-datatables';
import { MenuRoutingModule } from './menu-routing.module';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
    imports: [
        IonicModule,
        MenuRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SafePipeModule,
        DataTablesModule,
        MarkdownModule.forRoot()
    ],
    declarations: [
    ]
})
export class MenuPageModule { }
