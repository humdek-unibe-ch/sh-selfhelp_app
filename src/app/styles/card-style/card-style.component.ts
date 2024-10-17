import { Component, OnInit, Input } from '@angular/core';
import { CardStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-card-style',
    templateUrl: './card-style.component.html',
    styleUrls: ['./card-style.component.scss'],
})
export class CardStyleComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: CardStyle;
    @Input() override parentForm!: FormGroup;
    isCardExpanded!: boolean;

    constructor(private selfhelp: SelfhelpService) {
        super();
    }

    override ngOnInit() {
        this.isCardExpanded = this.getFieldContent('is_expanded') == '1';
    }

    /**
     * Toggles the expansion state of a card.
     *
     * This method checks if the card is collapsible by evaluating the `is_collapsible` field.
     * If the card is collapsible (`is_collapsible` equals '1'), it toggles the `isCardExpanded`
     * state between true and false. This can be used to control the display of the card, such as
     * expanding or collapsing its content in the UI.
     */
    toggleCard() {
        if (this.getFieldContent('is_collapsible') == '1') {
            if (this.isCardExpanded) {
                this.isCardExpanded = false;
            } else {
                this.isCardExpanded = true;
            }
        }
    }

    /**
     * Handles the click event on an edit link and opens a modified URL.
     *
     * When the edit link is clicked, this method stops the event from propagating further
     * to prevent unintended effects on parent elements. It then constructs a URL by retrieving
     * the edit URL through `getFieldContent('url_edit')` and removing the base path portion of
     * the URL, which is obtained from `selfhelp.getBasePath()`. The resulting URL is then
     * opened using the `openUrl` method of the `selfhelp` object.
     *
     * This method is typically used to navigate to an edit page or a related content page with
     * a URL dynamically modified at runtime.
     *
     * @param {MouseEvent} e - The mouse event object associated with the click event.
     */
    edit_link_clicked(e: MouseEvent) {
        e.stopPropagation();
        const url = this.getFieldContent('url_edit').replace(this.selfhelp.getBasePath(), '');
        this.selfhelp.openUrl(url);
    }

}
