import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasherFeedbackComponent } from './dasher-feedback.component';

describe('DasherFeedbackComponent', () => {
  let component: DasherFeedbackComponent;
  let fixture: ComponentFixture<DasherFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasherFeedbackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasherFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
