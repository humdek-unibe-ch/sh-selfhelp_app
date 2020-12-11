import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabPage } from './tab.page';

import { TabPageRoutingModule } from './tab-routing.module';
import { BasicStyleComponent } from '../styles/basic-style/basic-style.component';
import { CardStyleComponent } from '../styles/card-style/card-style.component';
import { MarkdownStyleComponent } from '../styles/markdown-style/markdown-style.component';
import { ContainerStyleComponent } from '../styles/container-style/container-style.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        FormsModule,
        TabPageRoutingModule
    ],
    declarations: [
        TabPage,
        CardStyleComponent,
        BasicStyleComponent,
        MarkdownStyleComponent,
        ContainerStyleComponent
    ]
})
export class TabPageModule { }
