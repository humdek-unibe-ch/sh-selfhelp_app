import { Component, Input } from '@angular/core';
import { Language, LanguagePickerStyle } from 'src/app/selfhelpInterfaces';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { GlobalsService } from 'src/app/services/globals.service';

/**
 * Mobile side of the core `languagePicker` style. The web version posts to an
 * ajax endpoint; here every request already carries `id_languages`, so
 * switching is "remember the choice, then load a page again".
 */
@Component({
    selector: 'app-language-picker-style',
    templateUrl: './language-picker-style.component.html',
    styleUrls: ['./language-picker-style.component.scss'],
    standalone: false
})
export class LanguagePickerStyleComponent extends BasicStyleComponent {
    @Input() override style!: LanguagePickerStyle;

    constructor(private selfhelpService: SelfhelpService, private globals: GlobalsService) {
        super();
    }

    /** Languages come with every page response, not with the style. */
    public get languages(): Language[] {
        return this.selfhelpService.selfhelp.value.languages ?? [];
    }

    /** One language is not a choice, same as the web render. */
    public get showPicker(): boolean {
        return this.languages.length > 1;
    }

    public get isSelect(): boolean {
        return this.getFieldContent('display_style') === 'select';
    }

    public get label(): string {
        return this.getFieldContent('label');
    }

    public isCurrent(language: Language): boolean {
        if (this.getFieldContent('highlight_selected') != '1') {
            return false;
        }
        return this.selfhelpService.selfhelp.value.user_language == language.id;
    }

    /**
     * @description Remember the language, then reload a page so the server
     * renders it in the new one.
     * @param {*} id - The chosen language id.
     */
    public selectLanguage(id: any): void {
        if (!id) {
            return;
        }
        this.selfhelpService.setUserLanguage(Number(id));
        const target = this.getFieldContent('redirect_at_select');
        if (target) {
            // a CMS page keyword; urls in this app start with a slash
            this.selfhelpService.openUrl(target.startsWith('/') ? target : '/' + target);
        } else {
            const current = this.selfhelpService.selfhelp.value.current_url;
            this.selfhelpService.getPage(current ? current : this.globals.SH_API_HOME);
        }
    }
}
