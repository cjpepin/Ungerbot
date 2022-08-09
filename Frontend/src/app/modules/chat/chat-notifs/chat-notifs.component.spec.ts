import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatNotifsComponent } from './chat-notifs.component';

describe('ChatNotifsComponent', () => {
  let component: ChatNotifsComponent;
  let fixture: ComponentFixture<ChatNotifsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatNotifsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatNotifsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
