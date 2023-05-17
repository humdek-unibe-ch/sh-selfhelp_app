import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabJsStyleComponent } from './lab-js-style.component';

describe('LabJsStyleComponent', () => {
  let component: LabJsStyleComponent;
  let fixture: ComponentFixture<LabJsStyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabJsStyleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabJsStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
