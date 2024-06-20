import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SurveyJSMetaData, SurveyJSStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { Model, StylesManager } from "survey-core";
import "survey-core/survey.i18n";
import { IDocOptions, SurveyPDF } from 'survey-pdf';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import packageJson from './../../../../package.json'; // Replace with the actual path to your package.json file
import { GlobalsService } from 'src/app/services/globals.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AlertController } from '@ionic/angular';


@Component({
    selector: 'app-survey-js-style',
    templateUrl: './survey-js-style.component.html',
    styleUrls: ['./survey-js-style.component.css']
})
export class SurveyJSStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: SurveyJSStyle;
    surveyModel!: Model;
    autoSaveTimers: { [key: string]: any } = {};
    tempFileStorage: any = {};
    pdfDocOptions: IDocOptions = {
        fontSize: 12
    };
    surveyJSSavedSuccessfully: boolean = false;

    constructor(private selfhelpService: SelfhelpService, private globals: GlobalsService, private utils: UtilsService, private alertController: AlertController) {
        super();
    }

    override async ngOnInit() {
        this.initSurveyJS();
    }

    /**
     * Save a PDF document based on survey data.
     *
     * @param {any} surveyData - The survey data to be used for generating the PDF.
     */
    private async savePdf(surveyData: any) {
        const surveyPdf = new SurveyPDF(this.style.survey_json, this.pdfDocOptions);
        surveyPdf.data = surveyData;
        // surveyPdf.save(this.style.survey_json.title.default || this.style.survey_json.title);
        let fileName = (this.style.survey_json.title.default || this.style.survey_json.title) + '.pdf';
        surveyPdf.raw().then(async function (raw) {
            let res = await Filesystem.writeFile({
                path: packageJson.name + "/" + fileName,
                data: raw,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
                recursive: true
            });
            alert('Survey was exported as pdf and the file can be found in your documents folder: ' + packageJson.name);
        });
    };

    /**
         * Save a survey using SurveyJS data and trigger a server request.
         *
         * @param {Model} survey - The SurveyJS model representing the survey.
         * @param {Number | undefined} newPageNo - The new page that will be loaded after the save
         * @returns {boolean} Returns true if the survey was successfully saved; otherwise, false.
         */

    /**
     * @description Save a survey using SurveyJS data and trigger a server request.
     * @author Stefan Kodzhabashev
     * @date 30/05/2024
     * @private
     * @param {Model} survey - The SurveyJS model representing the survey.
     * @param {(Number | undefined)} newPageNo - The new page that will be loaded after the save
     * @return {*} Returns true if the survey was successfully saved; otherwise, false.
     * @memberof SurveyJSStyleComponent
     */
    private saveSurveyJS(survey: Model, newPageNo: Number | undefined): Promise<Boolean> {
        return new Promise((resolve, reject) => {
            let data = { ...survey.data };
            data.pageNo = newPageNo != undefined ? newPageNo : survey.currentPageNo;
            survey.setValue('pageNo', data.pageNo);
            if (!data['trigger_type'] || !data['response_id']) {
                // not initialized yet
                resolve(false);
            }
            data['_json'] = JSON.stringify(data);
            this.utils.debugLog('saveSurveyJS', 'saveSurveyJS');
            return this.selfhelpService.execServerRequest(this.url, data).then((res) => {
                resolve(true);
            })
                .catch((err) => {
                    this.dataNotSaved();
                    resolve(false);
                });
        });
    }

    private endSurvey() {
        if (this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal('submit');
            if (this.getFieldContent('redirect_at_end') != '') {
                this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
            } else {
                this.selfhelpService.getPage(this.globals.SH_API_HOME);
            }
        } else {
            if (this.getFieldContent('redirect_at_end') != '') {
                this.selfhelpService.openUrl(this.getFieldContent('redirect_at_end'));
            }
        }
        this.style['end'] = this.style['end'] ? (this.style['end'] + 1) : 1; // work around to refresh the page when it is pointed to self
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

    /**
 * Upload files associated with survey questions and update question values with metadata.
 *
 * @param {Survey} survey - The survey object containing questions and data.
 * @returns {Promise} A Promise that resolves when all file uploads are completed successfully,
 *                    or rejects if any of the uploads fail.
 */
    private uploadFiles(survey: Model) {
        return new Promise<void>((resolve, reject) => {
            const questionsToUpload = Object.keys(this.tempFileStorage);

            if (questionsToUpload.length === 0) {
                resolve(); // No files to upload, resolve immediately
            } else {
                const uploadPromises = [];

                for (let i = 0; i < questionsToUpload.length; i++) {
                    const questionName = questionsToUpload[i];
                    const question = survey.getQuestionByName(questionName);
                    const filesToUpload = this.tempFileStorage[questionName];

                    const formData = new FormData();
                    filesToUpload.forEach((file: File) => {
                        formData.append(file.name, file);
                    });

                    formData.append("upload_files", "true");
                    formData.append("response_id", survey.data['response_id']);
                    formData.append("question_name", questionName);

                    const uploadPromise = fetch(this.selfhelpService.API_ENDPOINT_NATIVE + this.url, {
                        method: "POST",
                        body: formData
                    })
                        .then((response) => {
                            return response.json()
                        })
                        .then(data => {
                            // Save metadata about uploaded files as the question value
                            question.value = filesToUpload.map((file: File) => {
                                return {
                                    name: file.name,
                                    type: file.type,
                                    content: data[file.name]
                                };
                            });

                        })
                        .catch(error => {
                            console.error("Error:", error);
                            reject(error); // Reject the promise if there's an error
                        });

                    uploadPromises.push(uploadPromise);
                }

                // Wait for all upload promises to complete before resolving
                Promise.all(uploadPromises)
                    .then(() => {
                        resolve(); // All uploads completed successfully
                    })
                    .catch(error => {
                        reject(error); // Reject if any of the uploads failed
                    });
            }
        });
    }

    /**
     * @description Show an alert when the survey js is not saved
     * @author Stefan Kodzhabashev
     * @date 31/05/2024
     * @memberof SurveyJSStyleComponent
     */
    async dataNotSaved() {
        const alert = await this.alertController.create({
            cssClass: '',
            header: 'Error',
            message: 'Data not saved!',
            backdropDismiss: false,
            buttons: [
                {
                    text: 'OK',
                    role: 'cancel',
                    cssClass: 'text-danger',
                    handler: () => {

                    }
                }
            ]
        });
        await alert.present();
    }

    private initSurveyJS() {
        if (this.style.show_survey) {
            StylesManager.applyTheme(this.getFieldContent('survey-js-theme'));
            let survey = new Model(this.style.survey_json);
            survey.locale = this.selfhelpService.getUserLanguage().locale;
            if (Number(this.getFieldContent('auto_save_interval')) > 0) {
                this.autoSaveTimers[this.style.survey_generated_id] = window.setInterval(() => {
                    survey.setValue('trigger_type', 'updated'); // change the trigger type to updated
                    this.saveSurveyJS(survey, undefined);
                }, Number(this.getFieldContent('auto_save_interval')) * 1000);
            }
            if (this.getFieldContent('restart_on_refresh') != '1') {
                // Restore survey results
                const notCompletedSurvey = this.style.last_response;
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
            }
            if (!survey.data['response_id'] && this.style.survey_generated_id) {
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
                this.style.last_response = survey.data; // set the last response otherwise it will generate another id
                this.saveSurveyJS(survey, undefined);
            }
            survey.onCurrentPageChanging.add((sender, options) => {
                options.allow = this.surveyJSSavedSuccessfully;
                if (this.surveyJSSavedSuccessfully) {
                    // it was saved move to next page and mark the new page as not saved yet
                    this.surveyJSSavedSuccessfully = false;
                    return;
                }
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
                this.surveyJSSavedSuccessfully = false;
                this.saveSurveyJS(sender, survey.visiblePages.indexOf(options.newCurrentPage)).then((res) => {
                    if (res) {
                        this.surveyJSSavedSuccessfully = true;
                        survey.currentPage = options.newCurrentPage;
                    }
                });;
            });
            survey.onComplete.add((sender, options) => {
                options.showSaveInProgress();
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
                this.uploadFiles(sender)
                    .then(() => {
                        this.saveSurveyJS(sender, undefined).then((res) => {
                            if (res) {
                                options.showSaveSuccess();
                                this.endSurvey();
                            } else {
                                options.showSaveError();
                            }
                        });
                    })
                    .catch((error: any) => {
                        // Handle any errors that occurred during uploads
                        console.error("Upload error:", error);
                    });
            });

            // custom catch for upload files when storeDataAsText is false
            survey.onUploadFiles.add((_, options) => {
                // Add files to the temporary storage
                if (this.tempFileStorage[options.name] !== undefined && this.tempFileStorage[options.name].length > 0) {
                    this.tempFileStorage[options.name].concat(options.files);
                } else {
                    this.tempFileStorage[options.name] = options.files;
                }
                // Load file previews
                const content: any[] = [];
                options.files.forEach(file => {
                    const fileReader = new FileReader();
                    fileReader.onload = () => {
                        content.push({
                            name: file.name,
                            type: file.type,
                            content: fileReader.result,
                            file: file
                        });
                        if (content.length === options.files.length) {
                            // Return a file for preview as a { file, content } object
                            options.callback(
                                content.map(fileContent => {
                                    return {
                                        file: fileContent.file,
                                        content: fileContent.content
                                    };
                                })
                            );
                        }
                    };
                    fileReader.readAsDataURL(file);
                });

            });

            // Handles file removal
            survey.onClearFiles.add((_, options) => {
                // Empty the temporary file storage if "Clear All" is clicked
                if (options.fileName === null) {
                    this.tempFileStorage[options.name] = [];
                    options.callback("success");
                    return;
                }

                // Remove an individual file
                const tempFiles = this.tempFileStorage[options.name];
                if (!!tempFiles) {
                    const fileInfoToRemove = tempFiles.filter((file: File) => file.name === options.fileName)[0];
                    if (fileInfoToRemove) {
                        const index = tempFiles.indexOf(fileInfoToRemove);
                        tempFiles.splice(index, 1);
                    }
                }
                options.callback("success");
            });

            if (this.getFieldContent('save_pdf') == 1) {

                const exportToPdfOptions = {};
                survey['setLicenseKey'] = "ZWUzYjk4NjctYmYzMi00ZmFiLWFlODQtMGE4OTBjMTNiYTRkOzE9MjAyNC0wNC0yNSwyPTIwMjQtMDQtMjUsND0yMDI0LTA0LTI1";


                survey.addNavigationItem({
                    id: "pdf-export",
                    title: "Save as PDF",
                    action: () => this.savePdf(survey.data)
                });
            }

            this.surveyModel = survey;
        }
    }

}
