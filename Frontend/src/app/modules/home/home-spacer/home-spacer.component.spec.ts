import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeSpacerComponent } from './home-spacer.component';

describe('HomeSpacerComponent', () => {
  let component: HomeSpacerComponent;
  let fixture: ComponentFixture<HomeSpacerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeSpacerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeSpacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
