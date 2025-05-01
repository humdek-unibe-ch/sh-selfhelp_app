import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TwoFactorAuthStyleComponent } from './two-factor-auth-style.component';

describe('TwoFactorAuthStyleComponent', () => {
  let component: TwoFactorAuthStyleComponent;
  let fixture: ComponentFixture<TwoFactorAuthStyleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoFactorAuthStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TwoFactorAuthStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
