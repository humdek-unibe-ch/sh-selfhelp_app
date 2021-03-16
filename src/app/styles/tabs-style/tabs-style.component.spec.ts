import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TabsStyleComponent } from './tabs-style.component';

describe('TabsStyleComponent', () => {
  let component: TabsStyleComponent;
  let fixture: ComponentFixture<TabsStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabsStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
