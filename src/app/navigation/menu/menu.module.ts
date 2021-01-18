import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabPage } from './menu.page';
import { TabPageRoutingModule } from './menu-routing.module';
import { BasicStyleComponent } from '../../styles/basic-style/basic-style.component';
import { CardStyleComponent } from '../../styles/card-style/card-style.component';
import { MarkdownStyleComponent } from '../../styles/markdown-style/markdown-style.component';
import { ContainerStyleComponent } from '../../styles/container-style/container-style.component';
import { FormUserInputStyleComponent } from '../../styles/form-user-input-style/form-user-input-style.component';
import { ConditionalContainerStyleComponent } from '../../styles/conditional-container-style/conditional-container-style.component';
import { SubMenuComponent } from '../sub-menu/sub-menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputStyleComponent } from '../../styles/input-style/input-style.component';
import { RadioStyleComponent } from '../../styles/radio-style/radio-style.component';
import { SelectStyleComponent } from '../../styles/select-style/select-style.component';
import { TextareaStyleComponent } from '../../styles/textarea-style/textarea-style.component';
import { QualtricsSurveyStyleComponent } from '../../styles/qualtrics-survey-style/qualtrics-survey-style.component';
import { SafePipeModule } from 'safe-pipe';
import { DivStyleComponent } from '../../styles/div-style/div-style.component';
import { ImageStyleComponent } from '../../styles/image-style/image-style.component';
import { VideoStyleComponent } from '../../styles/video-style/video-style.component';
import { AlertStyleComponent } from '../../styles/alert-style/alert-style.component';
import { PlaintextStyleComponent } from '../../styles/plaintext-style/plaintext-style.component';
import { MarkdownInlineStyleComponent } from '../../styles/markdown-inline-style/markdown-inline-style.component';
import { HeadingStyleComponent } from '../../styles/heading-style/heading-style.component';
import { RawTextStyleComponent } from '../../styles/raw-text-style/raw-text-style.component';
import { AudioStyleComponent } from '../../styles/audio-style/audio-style.component';
import { FigureStyleComponent } from '../../styles/figure-style/figure-style.component';
import { ProgressBarStyleComponent } from '../../styles/progress-bar-style/progress-bar-style.component';
import { CarouselStyleComponent } from '../../styles/carousel-style/carousel-style.component';
import { JumbotronStyleComponent } from '../../styles/jumbotron-style/jumbotron-style.component';
import { TabsStyleComponent } from 'src/app/styles/tabs-style/tabs-style.component';
import { GraphStyleComponent } from 'src/app/styles/graph-style/graph-style.component';
import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { DataTablesModule } from 'angular-datatables';
import { ShowUserInputStyleComponent } from 'src/app/styles/show-user-input-style/show-user-input-style.component';
import { ButtonStyleComponent } from 'src/app/styles/button-style/button-style.component';
import { LinkStyleComponent } from 'src/app/styles/link-style/link-style.component';
import { AccordionListStyleComponent } from 'src/app/styles/accordion-list-style/accordion-list-style.component';
import { NestedListStyleComponent } from 'src/app/styles/nested-list-style/nested-list-style.component';
import { SortableListComponent } from 'src/app/styles/sortable-list/sortable-list.component';
import { NavigationContainerStyleComponent } from 'src/app/styles/navigation-container-style/navigation-container-style.component';
import { JsonStyleComponent } from 'src/app/styles/json-style/json-style.component';
import { QuizStyleComponent } from 'src/app/styles/quiz-style/quiz-style.component';
import { LoginComponent } from 'src/app/components/login/login.component';
import { LoginStyleComponent } from 'src/app/styles/login-style/login-style.component';
import { RegisterStyleComponen } from 'src/app/styles/register-style/register-style.component';
import { ProfileStyleComponent } from 'src/app/styles/profile-style/profile-style.component';
import { ProfileComponent } from 'src/app/components/profile/profile.component';

@NgModule({
    imports: [
        IonicModule,
        CommonModule,
        TabPageRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        SafePipeModule,
        PlotlyViaWindowModule,
        DataTablesModule
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
        LoginComponent,
        LoginStyleComponent,
        RegisterStyleComponen,
        ProfileComponent,
        ProfileStyleComponent
    ]
})
export class TabPageModule { }
