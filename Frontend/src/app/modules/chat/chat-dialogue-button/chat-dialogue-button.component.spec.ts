import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatDialogueButtonComponent } from './chat-dialogue-button.component';

describe('ChatDialogueButtonComponent', () => {
  let component: ChatDialogueButtonComponent;
  let fixture: ComponentFixture<ChatDialogueButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatDialogueButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatDialogueButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
