import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabPage } from './tab.page';
import { TabPageRoutingModule } from './tab-routing.module';
import { BasicStyleComponent } from '../styles/basic-style/basic-style.component';
import { CardStyleComponent } from '../styles/card-style/card-style.component';
import { MarkdownStyleComponent } from '../styles/markdown-style/markdown-style.component';
import { ContainerStyleComponent } from '../styles/container-style/container-style.component';
import { FormUserInputStyleComponent } from '../styles/form-user-input-style/form-user-input-style.component';
import { ConditionalContainerStyleComponent } from '../styles/conditional-container-style/conditional-container-style.component';
import { SubMenuComponent } from '../menu/sub-menu/sub-menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        TabPageRoutingModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        TabPage,
        CardStyleComponent,
        BasicStyleComponent,
        MarkdownStyleComponent,
        ContainerStyleComponent,
        FormUserInputStyleComponent,
        ConditionalContainerStyleComponent,
        SubMenuComponent        
    ]
})
export class TabPageModule { }
