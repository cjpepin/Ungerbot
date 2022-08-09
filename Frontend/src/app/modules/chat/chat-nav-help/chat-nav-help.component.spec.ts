import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatNavHelpComponent } from './chat-nav-help.component';

describe('ChatNavHelpComponent', () => {
  let component: ChatNavHelpComponent;
  let fixture: ComponentFixture<ChatNavHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatNavHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatNavHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
