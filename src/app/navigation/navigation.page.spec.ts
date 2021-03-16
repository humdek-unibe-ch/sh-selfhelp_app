import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationPage } from './navigation.page';

describe('NavigationPage', () => {
  let component: NavigationPage;
  let fixture: ComponentFixture<NavigationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NavigationPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
