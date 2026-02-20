import { Component, OnInit, Input } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { LlmResponseStyle } from '../../selfhelpInterfaces';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-llm-response-style',
    templateUrl: './llm-response-style.component.html',
    styleUrls: ['./llm-response-style.component.scss'],
})
export class LlmResponseStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: LlmResponseStyle;
    @Input() override parentForm!: FormGroup;

    editValue: string = '';

    constructor() {
        super();
    }

    override ngOnInit() {
        if (this.isEditable && this.style.content) {
            this.editValue = this.style.content;
        }
    }

    get isEditable(): boolean {
        return this.style.editable === true;
    }

    get content(): string {
        return this.style.content || this.getFieldContent('text_md') || '';
    }

    get fieldName(): string {
        return this.style.name || this.getFieldContent('name') || '';
    }

    onValueChange(value: string) {
        this.editValue = value;
        if (this.parentForm && this.fieldName) {
            this.parentForm.patchValue({ [this.fieldName]: value });
        }
    }
}
