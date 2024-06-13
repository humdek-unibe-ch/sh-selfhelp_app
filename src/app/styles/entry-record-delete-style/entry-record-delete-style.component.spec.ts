import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EntryRecordDeleteStyleComponent } from './entry-record-delete-style.component';

describe('EntryRecordDeleteStyleComponent', () => {
  let component: EntryRecordDeleteStyleComponent;
  let fixture: ComponentFixture<EntryRecordDeleteStyleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EntryRecordDeleteStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EntryRecordDeleteStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
