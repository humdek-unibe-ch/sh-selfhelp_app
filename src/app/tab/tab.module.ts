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
import { InputStyleComponent } from '../styles/input-style/input-style.component';
import { RadioStyleComponent } from '../styles/radio-style/radio-style.component';
import { SelectStyleComponent } from '../styles/select-style/select-style.component';
import { TextareaStyleComponent } from '../styles/textarea-style/textarea-style.component';
import { QualtricsSurveyStyleComponent } from '../qualtrics-survey-style/qualtrics-survey-style.component';
import { SafePipeModule } from 'safe-pipe';
import { DivStyleComponent } from '../styles/div-style/div-style.component';
import { ImageStyleComponent } from '../styles/image-style/image-style.component';
import { VideoStyleComponent } from '../styles/video-style/video-style.component';
import { AlertStyleComponent } from '../styles/alert-style/alert-style.component';
import { PlaintextStyleComponent } from '../styles/plaintext-style/plaintext-style.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        TabPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SafePipeModule
    ],
    declarations: [
        TabPage,
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
        PlaintextStyleComponent
    ]
})
export class TabPageModule { }
