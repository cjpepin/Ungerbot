import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YouveBeenKickedComponent } from './youve-been-kicked.component';

describe('YouveBeenKickedComponent', () => {
  let component: YouveBeenKickedComponent;
  let fixture: ComponentFixture<YouveBeenKickedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YouveBeenKickedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YouveBeenKickedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
