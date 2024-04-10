import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfHelp, ShepherdJSStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
declare var $: any;
import { ShepherdService } from 'angular-shepherd';

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

    override ngOnInit(): void {
        // let shep = this;
        // $(document).ready(function () {
        //     console.log('on',$('#tab-button-home'));
        //     setTimeout(() => {
        //         console.log($('#tab-button-home'));
        //     }, 1000);
        //     shep.initiShepherd();
        // });
    }

    ngAfterViewInit() {
        console.log('loaded', $('#tab-button-home'));
        console.log(this.ionContent);
        console.log($('ion-tab-button:first-child'));
        this.initiShepherd();
        // console.log($('#tab-button-home'));
        // setTimeout(() => {
        //     this.initiShepherd();
        // }, 1000);
        // console.log('after',$('#tab-button-home'));
        // setTimeout(() => {
        //     console.log($('#tab-button-home'));
        // }, 1000);
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

    initiShepherd() {
        console.log(this.style);
        console.log('nav', this.selfhelp.selfhelp.value.navigation);
        if (!this.tour.isActive) {
            // if not create it
            let steps = this.style.steps.content;
            steps.forEach((step: any) => {
                step.buttons.forEach((button: any) => {
                    if (button.action) {
                        if (this.getFieldContent('use_javascript') == "1") {
                            try {
                                button.action = eval(button.action);
                                // button.action = () => {
                                //     this.selfhelp.openUrl('/tasks');
                                //     this.tour.next();

                                // }
                            } catch (error) {
                                // console.error(error);
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
            if(this.style.options.content['useModalOverlay']){
                this.tour.modal = this.style.options.content['useModalOverlay'];
            }
            if(this.style.options.content['confirmCancel']){
                this.tour.confirmCancel = this.style.options.content['confirmCancel'];
            }
            this.tour.addSteps(steps);
            this.tour.start();
        } else {
            this.tour.show(this.style.state['step_index']);
        }
        console.log('shepherd-service', this.tour);
    }

}
