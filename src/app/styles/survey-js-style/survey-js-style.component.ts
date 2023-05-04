import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SurveyJSStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { Model, StylesManager  } from "survey-core";

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
        console.log(this.url);
        StylesManager.applyTheme(this.getFieldContent('survey-js-theme'));
        this.surveyModel = new Model(this.style.survey_json);
    }

    private saveSurveyJS(surveyFields, survey) {
        let data = { ...survey.data };
        data.pageNo = survey.currentPageNo;
        if (!surveyFields['restart_on_refresh'] && data['survey_generated_id']) {
            window.localStorage.setItem(data['survey_generated_id'], JSON.stringify(data));
        }
        data['_json'] = JSON.stringify(data);
        $.ajax({
            type: 'post',
            url: this.url,
            data: data,
            success: function (r) {
                if (data['trigger_type'] == 'finished') {
                    // on successful save on completed survey remove the local storage data
                    window.localStorage.removeItem(data['survey_generated_id']);
                    if (surveyFields['redirect_at_end']) {
                        window.location.href = surveyFields['redirect_at_end'];
                    }
                }
            }
        });
    }

}
