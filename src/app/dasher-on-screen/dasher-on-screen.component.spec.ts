import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasherOnScreenComponent } from './dasher-on-screen.component';

describe('DasherOnScreenComponent', () => {
  let component: DasherOnScreenComponent;
  let fixture: ComponentFixture<DasherOnScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasherOnScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasherOnScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
