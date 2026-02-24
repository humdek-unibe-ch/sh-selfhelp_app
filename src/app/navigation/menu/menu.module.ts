import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SafePipe } from 'safe-pipe';
import { MenuRoutingModule } from './menu-routing.module';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
    imports: [
        IonicModule,
        MenuRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SafePipe,
        MarkdownModule.forRoot()
    ],
    declarations: [
    ]
})
export class MenuPageModule { }
