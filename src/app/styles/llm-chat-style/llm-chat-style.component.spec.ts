import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { LlmChatStyleComponent } from './llm-chat-style.component';

describe('LlmChatStyleComponent', () => {
    let component: LlmChatStyleComponent;
    let fixture: ComponentFixture<LlmChatStyleComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [LlmChatStyleComponent],
            imports: [IonicModule.forRoot()]
        }).compileComponents();

        fixture = TestBed.createComponent(LlmChatStyleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
