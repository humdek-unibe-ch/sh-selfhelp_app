import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SurveyJSStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { Model } from "survey-core";

@Component({
    selector: 'app-survey-js-style',
    templateUrl: './survey-js-style.component.html',
    styleUrls: ['./survey-js-style.component.css']
})
export class SurveyJSStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: SurveyJSStyle;
    surveyModel: Model;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    ngOnInit(): void {
        console.log(this.style);
        const survey = new Model(this.style.survey_json);
        this.surveyModel = survey;
    }

}
