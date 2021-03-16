import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InputStyleComponent } from './input-style.component';

describe('InputStyleComponent', () => {
  let component: InputStyleComponent;
  let fixture: ComponentFixture<InputStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InputStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InputStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
