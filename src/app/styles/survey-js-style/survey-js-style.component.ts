import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SurveyJSMetaData, SurveyJSStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { Model, StylesManager } from "survey-core";
import { Preferences } from '@capacitor/preferences';

@Component({
    selector: 'app-survey-js-style',
    templateUrl: './survey-js-style.component.html',
    styleUrls: ['./survey-js-style.component.css']
})
export class SurveyJSStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: SurveyJSStyle;
    surveyModel!: Model;
    autoSaveTimers: { [key: string]: any } = {};

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

    override async ngOnInit() {
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
                    var timeoutExpired = this.checkTimeout(this.getFieldContent('timeout'), notCompletedSurvey);
                    if (!timeoutExpired) {
                        survey.data = notCompletedSurvey;
                        survey.setValue('trigger_type', 'updated');
                        if (survey.data.pageNo) {
                            survey.currentPageNo = survey.data.pageNo;
                        }
                    }
                }
                this.saveSurveyJS(survey);
            }
            if (!survey.data['response_id']) {
                var dateNow = Date.now();
                const uniqueId = dateNow.toString(36) + Math.random().toString(36).substring(2, 7);
                survey.setValue('response_id', "RJS_" + uniqueId.substring(uniqueId.length - 16));
                survey.setValue('trigger_type', 'started');
                survey.setValue('survey_generated_id', this.style.survey_generated_id);
                var metaData: SurveyJSMetaData = {
                    user_agent: navigator.userAgent,
                    screen_width: window.screen.width,
                    screen_height: window.screen.height,
                    pixel_ratio: window.devicePixelRatio,
                    viewport_width: window.innerWidth,
                    viewport_height: window.innerHeight,
                    start_time: new Date(dateNow),
                    pages: [
                        {
                            pageNo: survey.currentPageNo, // Assuming you have defined survey.currentPageNo elsewhere
                            start_time: new Date(dateNow),
                        },
                    ],
                };
                survey.setValue('_meta', metaData);
                this.saveSurveyJS(survey);
            }
            survey.onCurrentPageChanged.add((sender, options) => {
                var dateNow = Date.now();
                var meta: SurveyJSMetaData = survey.getValue('_meta');
                if (meta) {
                    meta['pages'][meta['pages'].length - 1]['end_time'] = new Date(dateNow);
                    meta['pages'][meta['pages'].length - 1]['duration'] = ((dateNow - new Date(meta['pages'][meta['pages'].length - 1]['start_time']).getTime()) / 1000);
                    meta['pages'].push({
                        'pageNo': survey.currentPageNo,
                        'start_time': new Date(dateNow)
                    });
                    sender.setValue('_meta', meta);
                }
                sender.setValue('trigger_type', 'updated');
                this.saveSurveyJS(sender);
            });
            survey.onComplete.add((sender, options) => {
                if (Number(this.getFieldContent('auto_save_interval')) > 0) {
                    // clear the timer when the survey is finished
                    clearInterval(this.autoSaveTimers[this.style.survey_generated_id]);
                }
                sender.setValue('trigger_type', 'finished');
                var dateNow = Date.now();
                var meta = survey.getValue('_meta');
                if (meta) {
                    meta['duration'] = (dateNow - new Date(meta['start_time']).getTime()) / 1000; // save duration in seconds
                    meta['end_time'] = new Date(dateNow);
                    meta['pages'][meta['pages'].length - 1]['end_time'] = new Date(dateNow);
                    meta['pages'][meta['pages'].length - 1]['duration'] = ((dateNow - new Date(meta['pages'][meta['pages'].length - 1]['start_time']).getTime()) / 1000);
                    sender.setValue('_meta', meta);
                }
                this.saveSurveyJS(sender);
            });
            this.surveyModel = survey;
        }
    }

    private saveSurveyJS(survey: Model) {
        let data = { ...survey.data };
        data.pageNo = survey.currentPageNo;
        if (this.getFieldContent('restart_on_refresh') == '0' && data['survey_generated_id']) {
            Preferences.set({
                key: data['survey_generated_id'],
                value: JSON.stringify(data),
            });

        }
        data['_json'] = JSON.stringify(data);
        this.selfhelpService.execServerRequest(this.url, data).then((res) => {
            if (data['trigger_type'] == 'finished') {
                // on successful save on completed survey remove the local storage data
                Preferences.remove({ key: data['survey_generated_id'] });
                this.endSurvey();
            }
        })
            .catch((err) => {
                console.log(err);
                return false;
            });;
    }

    private getLocalSurvey(): object | boolean {
        return Preferences.get({ key: this.style.survey_generated_id }).then((val) => {
            if (val.value) {
                return JSON.parse(val.value);
            } else {
                return false;
            }
        });
    }

    private endSurvey() {
        if (this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal('submit');
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

    /**
     * Checks if a timeout has occurred based on the elapsed time since a survey started.
     *
     * @param {number} timeout - The timeout duration in minutes. Set to 0 if not configured.
     * @param {any} localSurvey - The survey object containing survey data and metadata.
     * @returns {boolean} True if a timeout has occurred, false otherwise.
     */
    private checkTimeout(timeout: number, localSurvey: any) {
        if (timeout == 0) {
            // not configured
            return false;
        } else {
            if (!localSurvey._meta) {
                return false;
            }
            var start_time = new Date(localSurvey['_meta']['start_time']).getTime();
            var time_now = Date.now();
            var time_passed = (time_now - start_time) / (1000 * 60); // in minutes
            if (time_passed > timeout) {
                return true;
            } else {
                return false;
            }
        }
    }

}
