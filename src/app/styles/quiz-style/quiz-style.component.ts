import { Component, Input, OnInit } from '@angular/core';
import { QuizStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

@Component({
    selector: 'app-quiz-style',
    templateUrl: './quiz-style.component.html',
    styleUrls: ['./quiz-style.component.scss'],
})
export class QuizStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() style: QuizStyle;

    constructor() {
        super();
    }

    ngOnInit() { }

}
