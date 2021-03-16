import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { JsonStyleComponent } from './json-style.component';

describe('JsonStyleComponent', () => {
  let component: JsonStyleComponent;
  let fixture: ComponentFixture<JsonStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsonStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(JsonStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
