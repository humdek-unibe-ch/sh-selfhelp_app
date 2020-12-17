import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ConditionalContainerStyleComponent } from './conditional-container-style.component';

describe('ConditionalContainerStyleComponent', () => {
  let component: ConditionalContainerStyleComponent;
  let fixture: ComponentFixture<ConditionalContainerStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConditionalContainerStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ConditionalContainerStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
