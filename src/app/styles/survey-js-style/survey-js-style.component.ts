import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SurveyJSStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { Model, StylesManager } from "survey-core";
import { Storage } from '@ionic/storage';

@Component({
    selector: 'app-survey-js-style',
    templateUrl: './survey-js-style.component.html',
    styleUrls: ['./survey-js-style.component.css']
})
export class SurveyJSStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: SurveyJSStyle;
    surveyModel: Model;
    autoSaveTimers = {};

    constructor(private selfhelpService: SelfhelpService, private storage: Storage) {
        super();
    }

    async ngOnInit() {
        if (this.style.show_survey) {
            StylesManager.applyTheme(this.getFieldContent('survey-js-theme'));
            let survey = new Model(this.style.survey_json);
            survey.locale = this.selfhelpService.getUserLanguage().locale;
            if (Number(this.getFieldContent('auto_save_interval')) > 0) {
                this.autoSaveTimers[this.style.survey_generated_id] = window.setInterval(() => {
                    survey.setValue('trigger_type', 'updated'); // change the trigger type to updated
                    this.saveSurveyJS(survey);
                }, Number(this.getFieldContent('auto_save_interval')) * 1000);
            }
            if (this.getFieldContent('restart_on_refresh') != '1') {
                // Restore survey results
                const notCompletedSurvey = await this.getLocalSurvey();
                if (notCompletedSurvey) {
                    survey.data = notCompletedSurvey;
                    survey.setValue('trigger_type', 'updated');
                    if (survey.data.pageNo) {
                        survey.currentPageNo = survey.data.pageNo;
                    }
                }
                this.saveSurveyJS(survey);
            }
            if (!survey.data['response_id']) {
                const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
                survey.setValue('response_id', "RJS_" + uniqueId.substring(uniqueId.length - 16));
                survey.setValue('trigger_type', 'started');
                survey.setValue('survey_generated_id', this.style.survey_generated_id);
                this.saveSurveyJS(survey);
            }
            survey.onCurrentPageChanged.add((sender, options) => {
                sender.setValue('trigger_type', 'updated');
                this.saveSurveyJS(sender);
            });
            survey.onComplete.add((sender, options) => {
                if (Number(this.getFieldContent('auto_save_interval')) > 0) {
                    // clear the timer when the survey is finished
                    clearInterval(this.autoSaveTimers[this.style.survey_generated_id]);
                }
                sender.setValue('trigger_type', 'finished');
                this.saveSurveyJS(sender);                
            });
            this.surveyModel = survey;
        }
    }

    private saveSurveyJS(survey: Model) {
        let data = { ...survey.data };
        data.pageNo = survey.currentPageNo;
        if (this.getFieldContent('restart_on_refresh') == '0' && data['survey_generated_id']) {
            this.storage.set(data['survey_generated_id'], JSON.stringify(data));
        }
        data['_json'] = JSON.stringify(data);
        this.selfhelpService.execServerRequest(this.url, data).then((res) => {
            if (data['trigger_type'] == 'finished') {
                // on successful save on completed survey remove the local storage data
                this.storage.remove(data['survey_generated_id']);
                this.endSurvey();
            }
        })
            .catch((err) => {
                console.log(err);
                return false;
            });;
    }

    private getLocalSurvey(): object | boolean {
        return this.storage.get(this.style.survey_generated_id).then((val) => {
            if (val) {
                try {
                    return JSON.parse(val);
                } catch (error) {
                    return false;
                }
            } else {
                return false;
            }
        });
    }

    private endSurvey() {
        if (this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal();
            if (this.getFieldContent('redirect_at_end') != '') {
                this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
            } else {
                this.selfhelpService.getPage(this.selfhelpService.API_HOME);
            }
        } else {
            if (this.getFieldContent('redirect_at_end') != '') {
                this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
            } else {
                this.selfhelpService.openUrl(this.url);
            }
        }
    }

}
