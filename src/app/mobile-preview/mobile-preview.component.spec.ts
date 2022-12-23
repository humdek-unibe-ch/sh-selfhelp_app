import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobilePreviewComponent } from './mobile-preview.component';

describe('MobilePreviewComponent', () => {
  let component: MobilePreviewComponent;
  let fixture: ComponentFixture<MobilePreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MobilePreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MobilePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
