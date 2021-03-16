import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RawTextStyleComponent } from './raw-text-style.component';

describe('RawTextStyleComponent', () => {
  let component: RawTextStyleComponent;
  let fixture: ComponentFixture<RawTextStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RawTextStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RawTextStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
