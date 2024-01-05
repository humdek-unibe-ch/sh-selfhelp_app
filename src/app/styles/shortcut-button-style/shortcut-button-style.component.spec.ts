import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShortcutButtonStyleComponent } from './shortcut-button-style.component';

describe('ShortcutButtonStyleComponent', () => {
    let component: ShortcutButtonStyleComponent;
    let fixture: ComponentFixture<ShortcutButtonStyleComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [ShortcutButtonStyleComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(ShortcutButtonStyleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
