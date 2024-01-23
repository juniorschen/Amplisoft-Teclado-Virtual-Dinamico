import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasherOnScreenFeedbackModalComponent } from './dasher-on-screen-feedback-modal.component';

describe('DasherOnScreenFeedbackModalComponent', () => {
  let component: DasherOnScreenFeedbackModalComponent;
  let fixture: ComponentFixture<DasherOnScreenFeedbackModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasherOnScreenFeedbackModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasherOnScreenFeedbackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
