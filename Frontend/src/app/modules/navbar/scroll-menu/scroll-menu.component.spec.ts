import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollMenuComponent } from './scroll-menu.component';

describe('ScrollMenuComponent', () => {
  let component: ScrollMenuComponent;
  let fixture: ComponentFixture<ScrollMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScrollMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
