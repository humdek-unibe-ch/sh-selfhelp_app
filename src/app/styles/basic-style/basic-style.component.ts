import { Component, OnInit, Input } from '@angular/core';
import { Style } from './../../selfhelpInterfaces';
import { IonContent } from '@ionic/angular';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-basic-style',
    templateUrl: './basic-style.component.html',
    styleUrls: ['./basic-style.component.scss'],
})
export class BasicStyleComponent implements OnInit {
    @Input() style!: Style;
    @Input() url!: string;
    @Input() ionContent!: IonContent;
    @Input() parentForm!: FormGroup;

    constructor() { }

    ngOnInit() {
        console.log(this.style);
     }

    /**
     * @description Return the style
     * @author Stefan Kodzhabashev
     * @date 2020-12-16
     * @returns {Style}
     * @memberof BasicStyleComponent
     */
    public getStyle(): any {
        return this.style!;
    }

    /**
     * @description Check if the style is the same as the requested one
     * @author Stefan Kodzhabashev
     * @date 2020-12-16
     * @param {string} styleName
     * @returns {boolean}
     * @memberof BasicStyleComponent
     */
    public isStyle(styleName: string): boolean {
        return this.style! && this.style.style_name == styleName;
    }

    public isChildStyle(child: Style, styleName: string): boolean {
        return child && child.style_name == styleName;
    }

    /**
     * @description Return the css class names for the mobile app. Only class names that starts with `mobile-` are concidered as class names that we will use.
     * @author Stefan Kodzhabashev
     * @date 2020-12-16
     * @returns {string}
     * @memberof BasicStyleComponent
     */
    public getCss(): string {
        let mobileCss = '';
        if (this.style && this.style.css) {
            const cssClasses = this.style.css.split(' ');
            cssClasses.forEach(cssClass => {
                if (cssClass.startsWith('mobile-')) {
                    let mobileClass = cssClass.replace('mobile-', '');
                    mobileCss = mobileCss + (mobileCss == '' ? mobileClass : (' ' + mobileClass));
                }
            });
        }
        if (this.style && this.style.css_mobile) {
            mobileCss = mobileCss + ' ' + this.getFieldContent('css_mobile');
        }
        return mobileCss;
    }

    /**
     * @description Return the css class names of the selected style for the mobile app. Only class names that starts with `mobile-` are concidered as class names that we will use.
     * @author Stefan Kodzhabashev
     * @date 2020-12-16
     * @returns {string}
     * @memberof BasicStyleComponent
     */
    public getChildCss(style: Style): string {
        if (style && style.css) {
            const cssClasses = style.css.split(' ');
            let mobileCss = '';
            cssClasses.forEach(cssClass => {
                if (cssClass.startsWith('mobile-')) {
                    let mobileClass = cssClass.replace('mobile-', '');
                    mobileCss = mobileCss + (mobileCss == '' ? mobileClass : (' ' + mobileClass));
                }
            });
            return mobileCss;
        } else {
            return "";
        }
    }

    public getFieldContent(fieldName: string): any {
        return this.style && this.style[fieldName] ? this.style[fieldName].content : '';
    }

    public getChildFieldContent(child: Style, fieldName: string): string {
        return child[fieldName] ? child[fieldName].content : '';
    }

    public getFieldDefaut(fieldName: string): string {
        return this.style && this.style[fieldName] ? this.style[fieldName].default : '';
    }

    public getChildFieldDefault(child: Style, fieldName: string): string {
        return child[fieldName] ? child[fieldName].default : '';
    }

    public getID(): number | null {
        return this.style && this.style && this.style.id ? parseInt(this.style.id.content.toString()) : null;
    }

    public getChildID(child: Style): number | null {
        return child.id ? parseInt(child.id.content.toString()) : null;
    }

    public getIonContent() {
        return this.ionContent;
    }

}
