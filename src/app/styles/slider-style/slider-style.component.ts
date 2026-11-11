import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SliderStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';

/**
 * Mobile side of the core slider: an input of type range with a label under each position.
 */
@Component({
    selector: 'app-slider-style',
    templateUrl: './slider-style.component.html',
    styleUrls: ['./slider-style.component.scss'],
    standalone: false
})
export class SliderStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: SliderStyle;
    @Input() override parentForm!: FormGroup;
    locked = false;

    override ngOnInit() {
        const control = this.parentForm.controls[this.getFieldContent('name')];
        const value = control.value;
        if (value === '' || value === null || value === undefined) {
            // The browser puts an empty range input in the middle, so the web saves that
            control.setValue(Math.round((this.getMin() + this.getMax()) / 2));
        } else if (this.getFieldContent('locked_after_submit') === '1') {
            // Not disabled: a disabled control would drop out of the submitted values
            this.locked = true;
        }
    }

    getMin(): number {
        return Number(this.getFieldContent('min')) || 0;
    }

    getMax(): number {
        const max = this.getFieldContent('max');
        return max === '' ? 5 : Number(max);
    }

    // One label per position, "unknown" where none is set, as on web
    getLabels(): string[] {
        let labels = this.getFieldContent('labels');
        if (typeof labels === 'string') {
            try {
                labels = labels.trim() ? JSON.parse(labels) : null;
            } catch (e) {
                labels = null;
            }
        }
        if (!Array.isArray(labels)) {
            return [];
        }
        const out: string[] = [];
        for (let i = 0; i <= this.getMax() - this.getMin(); i++) {
            out.push(labels[i] !== undefined && labels[i] !== null ? String(labels[i]) : 'unknown');
        }
        return out;
    }
}
