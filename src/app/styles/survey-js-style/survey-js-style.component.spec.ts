import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyJSStyleComponent } from './survey-js-style.component';

describe('SurveyJSStyleComponent', () => {
  let component: SurveyJSStyleComponent;
  let fixture: ComponentFixture<SurveyJSStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyJSStyleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyJSStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
