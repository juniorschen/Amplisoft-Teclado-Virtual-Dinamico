import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DasherSidNavigationComponent } from './dasher-side-navigation.component';

describe('DasherSidNavigationComponent', () => {
  let component: DasherSidNavigationComponent;
  let fixture: ComponentFixture<DasherSidNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DasherSidNavigationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DasherSidNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
