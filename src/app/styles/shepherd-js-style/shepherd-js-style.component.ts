import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { ShepherdService } from 'angular-shepherd';
import { ShepherdJSStyle } from 'src/app/selfhelpInterfaces';
declare var $: any;

@Component({
    selector: 'app-shepherd-js-style',
    templateUrl: './shepherd-js-style.component.html',
    styleUrls: ['./shepherd-js-style.component.scss'],
})
export class ShepherdJsStyleComponent extends BasicStyleComponent implements AfterViewInit {
    @Input() override style!: ShepherdJSStyle;

    constructor(private shepherdService: ShepherdService) {
        super();
    }

    override ngOnInit(): void {
        setTimeout(() => {
            this.initiShepherd();
        }, 1000);
    }

    ngAfterViewInit() {
        console.log('view');
        setTimeout(() => {
            // this.initiShepherd();
        }, 1000);
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
                        } catch (error) {
                            if (button.action.includes('next')) {
                                button.action = this.shepherdService.next;
                            } else if (button.action.includes('back')) {
                                button.action = this.shepherdService.back;
                            } else if (button.action.includes('complete')) {
                                button.action = this.shepherdService.complete;
                            }
                            console.log('Wrong code for: ', button.action, error);
                        }
                    } else {
                        if (button.action.includes('next')) {
                            button.action = this.shepherdService.next;
                        } else if (button.action.includes('back')) {
                            button.action = this.shepherdService.back;
                        } else if (button.action.includes('complete')) {
                            button.action = this.shepherdService.complete;
                        } else {
                            button['orig_action'] = button['action'];
                            button.action = () => {
                                alert('Wrong action, check the console log for more information!');
                            };
                        }
                    }
                }
            });
        });
        console.log('new steps', steps);
        this.shepherdService.defaultStepOptions = this.style.options.content;
        this.shepherdService.modal = true;
        this.shepherdService.confirmCancel = false;
        this.shepherdService.addSteps(steps);
        this.shepherdService.start();
        console.log('shepherd-service', this.shepherdService);
    }

}
