import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupCustomThemeComponent } from './popup-custom-theme.component';

describe('PopupCustomThemeComponent', () => {
  let component: PopupCustomThemeComponent;
  let fixture: ComponentFixture<PopupCustomThemeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupCustomThemeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupCustomThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
