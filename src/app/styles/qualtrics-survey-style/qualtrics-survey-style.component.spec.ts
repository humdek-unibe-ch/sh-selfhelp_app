import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QualtricsSurveyStyleComponent } from './qualtrics-survey-style.component';

describe('QualtricsSurveyStyleComponent', () => {
  let component: QualtricsSurveyStyleComponent;
  let fixture: ComponentFixture<QualtricsSurveyStyleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ QualtricsSurveyStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QualtricsSurveyStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
