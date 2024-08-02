import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SurveyJsVoiceRecorderComponent } from './survey-js-voice-recorder.component';

describe('SurveyJsVoiceRecorderComponent', () => {
  let component: SurveyJsVoiceRecorderComponent;
  let fixture: ComponentFixture<SurveyJsVoiceRecorderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyJsVoiceRecorderComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyJsVoiceRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
