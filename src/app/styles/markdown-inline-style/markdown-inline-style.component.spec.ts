import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MarkdownInlineStyleComponent } from './markdown-inline-style.component';

describe('MarkdownInlineStyleComponent', () => {
  let component: MarkdownInlineStyleComponent;
  let fixture: ComponentFixture<MarkdownInlineStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkdownInlineStyleComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MarkdownInlineStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
