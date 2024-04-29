import { AfterViewInit, Component, Input } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfHelp, ShepherdJSStyle, ShepherdState } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
declare var $: any;
import { ShepherdService } from 'angular-shepherd';
import { Preferences } from '@capacitor/preferences';
import { GlobalsService } from 'src/app/services/globals.service';

@Component({
    selector: 'app-shepherd-js-style',
    templateUrl: './shepherd-js-style.component.html',
    styleUrls: ['./shepherd-js-style.component.scss'],
})
export class ShepherdJsStyleComponent extends BasicStyleComponent implements AfterViewInit {
    @Input() override style!: ShepherdJSStyle;

    constructor(private selfhelp: SelfhelpService, private tour: ShepherdService, private globals: GlobalsService) {
        super();
    }

    ngAfterViewInit() {
        this.loadShepherd();
    }

    /**
     * Get a predefined button action based on the provided action string.
     * @param {string} action The action string specifying the type of action.
     * @returns {Function} A function representing the predefined action.
     */
    getPredefinedButtonAction(action: string): Function {
        if (action.includes('next')) {
            return () => { return this.tour.next() };
        } else if (action.includes('back')) {
            return () => { return this.tour.back() };
        } else if (action.includes('complete')) {
            return () => { return this.tour.complete() };
        } else {
            return () => {
                console.error(action);
                alert('Wrong action, check the console log for more information!');
            };
        }
    }

    /**
     * Retrieves the local state of the Shepherd tour from the device's storage.
     * @returns {Promise<ShepherdState | boolean>} A promise that resolves with the local Shepherd tour state if found, or false if not found.
     */
    private getLocalShepherdState() {
        return Preferences.get({ key: this.globals.SH_SHEPHERD_PREFIX_NAME + this.style.options.content['tourName'] }).then((val) => {
            if (val.value) {
                return JSON.parse(val.value) as ShepherdState;
            } else {
                return false;
            }
        });
    }

    /**
     * Asynchronously loads and initializes Shepherd tour based on the provided configuration.
     * @returns {Promise<void>} A promise that resolves when Shepherd tour is loaded and initialized.
     */
    async loadShepherd() {
        let currentShepherdState: ShepherdState = {
            tourName: this.style.options.content['tourName'] as string,
            step_index: 0,
            trigger_type: "started"
        };
        // do not keep the state, on mobile we will always restart shepherd.
        let localState = await this.getLocalShepherdState();
        if (localState && localState !== null && typeof localState === 'object') {
            currentShepherdState = localState;
        }
        if (this.style.state) {
            // use the one form DB, if it exist
            // use only the trigger_type, if it was finished;
            currentShepherdState.trigger_type = this.style.state['trigger_type'];
        }
        if (this.style.show_once.content == "0" && currentShepherdState.trigger_type === 'finished') {
            // it was finished, but it can be done multiple times
            // reset
            currentShepherdState = {
                tourName: this.style.options.content['tourName'] as string,
                step_index: 0,
                trigger_type: "updated" // set it with status updated, because the entry is already in DB
            };
        }
        if (this.style.show_once.content == "1" && currentShepherdState['trigger_type'] === 'finished') {
            // already done, do not show
            return;
        }
        if (!this.tour.isActive) {
            // if not create it
            let steps = this.style.steps.content;
            steps.forEach((step: any) => {
                step.buttons.forEach((button: any) => {
                    if (button.action) {
                        if (this.getFieldContent('use_javascript') == "1") {
                            try {
                                button.action = eval(button.action);
                            } catch (error) {
                                button.action = this.getPredefinedButtonAction(button.action);
                            }
                        } else {
                            button.action = this.getPredefinedButtonAction(button.action);
                        }
                    }
                });
            });
            this.tour.defaultStepOptions = this.style.options.content;
            if (this.style.options.content['useModalOverlay']) {
                this.tour.modal = this.style.options.content['useModalOverlay'];
            }
            if (this.style.options.content['confirmCancel']) {
                this.tour.confirmCancel = this.style.options.content['confirmCancel'];
            }
            this.tour.addSteps(steps);
            this.tour.start();
            this.tour.show(currentShepherdState.step_index);
            let shepherdTour = this;
            this.tour.tourObject.on('show', function (event: any) {
                if (currentShepherdState && currentShepherdState.tourName) {
                    currentShepherdState.step_index = event.tour.steps.indexOf(event.step);
                    if (!currentShepherdState.trigger_type) {
                        currentShepherdState.trigger_type = 'started';
                    } else if (currentShepherdState.trigger_type !== 'finished') {
                        currentShepherdState.trigger_type = 'updated';
                    }
                    shepherdTour.saveShepherdState(currentShepherdState, true);
                }
            });

            // Catch the complete event
            this.tour.tourObject.on('complete', function () {
                currentShepherdState['trigger_type'] = 'finished';
                shepherdTour.saveShepherdState(currentShepherdState, true);
            });
        } else {
            this.tour.show(currentShepherdState.step_index);
        }
    }

    /**
     * Saves the current Shepherd tour state to local storage and sends it to the server.
     * @param {ShepherdState} currentShepherdState The current state of the Shepherd tour.
     * @param {boolean} saveOnServe If the data should be sent to server
     * @returns {boolean} Returns true if the state is successfully saved and sent to the server, otherwise false.
     */
    saveShepherdState(currentShepherdState: ShepherdState, saveOnServe: boolean) {
        Preferences.set({
            key: this.globals.SH_SHEPHERD_PREFIX_NAME + currentShepherdState.tourName,
            value: JSON.stringify(currentShepherdState),
        });
        if (saveOnServe) {
            this.selfhelp.execServerRequest(this.url, currentShepherdState).then((res) => { })
                .catch((err) => {
                    console.log(err);
                    return false;
                });
        }
    }

}
