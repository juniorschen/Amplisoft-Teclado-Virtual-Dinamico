import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasherControlSettingsComponent } from './dasher-control-settings.component';

describe('DasherControlSettingsComponent', () => {
  let component: DasherControlSettingsComponent;
  let fixture: ComponentFixture<DasherControlSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasherControlSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasherControlSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
