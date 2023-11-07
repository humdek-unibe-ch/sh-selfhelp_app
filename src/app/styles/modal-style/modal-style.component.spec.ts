import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStyleComponent } from './modal-style.component';

describe('ModalStyleComponent', () => {
  let component: ModalStyleComponent;
  let fixture: ComponentFixture<ModalStyleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalStyleComponent]
    });
    fixture = TestBed.createComponent(ModalStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
