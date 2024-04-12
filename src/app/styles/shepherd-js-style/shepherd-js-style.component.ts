import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfHelp, ShepherdJSStyle, ShepherdState } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
declare var $: any;
import { ShepherdService } from 'angular-shepherd';
import { Preferences } from '@capacitor/preferences';

@Component({
    selector: 'app-shepherd-js-style',
    templateUrl: './shepherd-js-style.component.html',
    styleUrls: ['./shepherd-js-style.component.scss'],
})
export class ShepherdJsStyleComponent extends BasicStyleComponent implements AfterViewInit {
    @Input() override style!: ShepherdJSStyle;

    constructor(private selfhelp: SelfhelpService, private tour: ShepherdService) {
        super();
    }

    ngAfterViewInit() {
        console.log('Shepherd - view - init');
        this.loadShepherd();
    }

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

    private getLocalShepherdState() {
        return Preferences.get({ key: this.style.options.content['tourName'] }).then((val) => {
            if (val.value) {
                return JSON.parse(val.value) as ShepherdState;
            } else {
                return false;
            }
        });
    }

    async loadShepherd() {
        console.log(this.style);
        console.log('nav', this.selfhelp.selfhelp.value.navigation);
        let currentShepherdState: ShepherdState = {
            tourName: this.style.options.content['tourName'] as string,
            step_index: 0,
            trigger_type: "started"
            // "id_users": shepherd_data['id_users']
        };
        let localState = await this.getLocalShepherdState();
        if (localState && localState !== null && typeof localState === 'object') {
            currentShepherdState = localState;
        }
        if (this.style.state.content) {
            // use the one form DB, if it exist
            // currentShepherdState = this.style.state.content;
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
                                console.log(button.action);
                                console.log(this.tour);
                                let t = this;
                                // Define the function using eval()
                                const evalFunction = eval(button.action);
                                // const evalFunction = eval('(() => { console.log(this); })');
                                // const evalFunction = eval('(function() { console.log(this); })');

                                // Bind this to the function
                                const boundFunction = evalFunction.bind(t);
                                button.action = evalFunction;
                                // button.action = ()=>{console.log(this.tour);};
                            } catch (error) {
                                console.error(error);
                                button.action = this.getPredefinedButtonAction(button.action);
                            }
                        } else {
                            button.action = this.getPredefinedButtonAction(button.action);
                        }
                    }
                });
            });
            console.log('starttttttttttttttttttttttt');
            this.tour.defaultStepOptions = this.style.options.content;
            if (this.style.options.content['useModalOverlay']) {
                this.tour.modal = this.style.options.content['useModalOverlay'];
            }
            if (this.style.options.content['confirmCancel']) {
                this.tour.confirmCancel = this.style.options.content['confirmCancel'];
            }
            console.log(steps);
            setTimeout(() => {
                this.tour.addSteps(steps);
                this.tour.start();
                // this.tour.show(currentShepherdState.step_index);

                let shep = this;
                this.tour.tourObject.on('show', function (event: any) {
                    if (currentShepherdState && currentShepherdState.tourName) {
                        currentShepherdState.step_index = event.tour.steps.indexOf(event.step);
                        if (!currentShepherdState.trigger_type) {
                            currentShepherdState.trigger_type = 'started';
                        } else if (currentShepherdState.trigger_type !== 'finished') {
                            currentShepherdState.trigger_type = 'updated';
                        }
                        shep.saveShepherdState(currentShepherdState);
                    }
                });

                // Catch the complete event
                this.tour.tourObject.on('complete', function () {
                    currentShepherdState['trigger_type'] = 'finished';
                    shep.saveShepherdState(currentShepherdState);
                });

            }, this.selfhelp.loadingSpinnerDuration);
        } else {
            // console.log('state', currentShepherdState);
            this.tour.show(currentShepherdState.step_index);
        }
        // Listen for when a step changes and update the stored step index

        console.log('shepherd-state', currentShepherdState);
    }

    saveShepherdState(currentShepherdState: ShepherdState) {
        Preferences.set({
            key: currentShepherdState.tourName,
            value: JSON.stringify(currentShepherdState),
        });
        // if (currentShepherdState['id_users'] && currentShepherdState['id_users'] > 1) {
        //     // save for the user
        //     $.ajax({
        //         type: 'post',
        //         url: window.location,
        //         data: currentShepherdState
        //     });
        // }
    }

}
