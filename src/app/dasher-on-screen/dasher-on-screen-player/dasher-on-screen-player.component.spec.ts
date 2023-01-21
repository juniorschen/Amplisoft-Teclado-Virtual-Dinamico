import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player.component';

describe('DasherOnScreenPlayerComponent', () => {
  let component: DasherOnScreenPlayerComponent;
  let fixture: ComponentFixture<DasherOnScreenPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasherOnScreenPlayerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasherOnScreenPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
