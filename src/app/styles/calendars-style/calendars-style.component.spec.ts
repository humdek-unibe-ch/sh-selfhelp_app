import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarsStyleComponent } from './calendars-style.component';

describe('CalendarsStyleComponent', () => {
  let component: CalendarsStyleComponent;
  let fixture: ComponentFixture<CalendarsStyleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarsStyleComponent]
    });
    fixture = TestBed.createComponent(CalendarsStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
