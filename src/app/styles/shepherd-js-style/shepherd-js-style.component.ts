import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ShepherdService } from 'angular-shepherd';
import { ShepherdJSStyle } from 'src/app/selfhelpInterfaces';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
declare var $: any;

@Component({
    selector: 'app-shepherd-js-style',
    templateUrl: './shepherd-js-style.component.html',
    styleUrls: ['./shepherd-js-style.component.scss'],
})
export class ShepherdJsStyleComponent extends BasicStyleComponent implements AfterViewInit {
    @Input() override style!: ShepherdJSStyle;

    constructor(private tour: ShepherdService, private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit(): void {

    }

    ngAfterViewInit() {
        console.log('view');
        setTimeout(() => {
            this.initiShepherd();
        }, 2000);
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
        console.log('shepherd', this.style);
        console.log('steps', this.style.steps.content);
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
        console.log('new steps', steps);
        this.tour.defaultStepOptions = this.style.options.content;
        this.tour.modal = true;
        this.tour.confirmCancel = false;
        this.tour.addSteps(steps);
        if (!this.tour.isActive) {
            // if not active start it
            console.log('starttttttttttttttttttttttt');
            this.tour.start();
        }
        console.log('shepherd-service', this.tour);
    }

}
