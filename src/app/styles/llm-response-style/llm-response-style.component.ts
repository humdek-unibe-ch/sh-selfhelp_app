import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { LlmResponseStyle } from '../../selfhelpInterfaces';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SelfhelpService } from '../../services/selfhelp.service';

@Component({
    selector: 'app-llm-response-style',
    templateUrl: './llm-response-style.component.html',
    styleUrls: ['./llm-response-style.component.scss'],
})
export class LlmResponseStyleComponent extends BasicStyleComponent implements OnInit, OnDestroy {
    @Input() override style!: LlmResponseStyle;
    @Input() override parentForm!: FormGroup;

    editValue: string = '';
    isFormSubmitting: boolean = false;
    private formSubmitSub?: Subscription;

    constructor(private selfhelpService: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        if (this.isEditable && this.style.content) {
            this.editValue = this.style.content;
        }

        this.formSubmitSub = this.selfhelpService.formSubmitting.subscribe(submitting => {
            this.isFormSubmitting = submitting;
        });
    }

    ngOnDestroy() {
        if (this.formSubmitSub) {
            this.formSubmitSub.unsubscribe();
        }
    }

    get sectionId(): any {
        return this.style.section_id || this.style.id?.content;
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

    get showLoading(): boolean {
        return this.isFormSubmitting && !this.isEditable;
    }

    onValueChange(value: string) {
        this.editValue = value;
        if (this.parentForm && this.fieldName) {
            this.parentForm.patchValue({ [this.fieldName]: value });
        }
    }
}
