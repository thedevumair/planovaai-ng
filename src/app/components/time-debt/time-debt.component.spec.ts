import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeDebtComponent } from './time-debt.component';

describe('TimeDebtComponent', () => {
  let component: TimeDebtComponent;
  let fixture: ComponentFixture<TimeDebtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeDebtComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimeDebtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
