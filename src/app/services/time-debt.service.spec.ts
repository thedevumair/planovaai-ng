import { TestBed } from '@angular/core/testing';

import { TimeDebtService } from './time-debt.service';

describe('TimeDebtService', () => {
  let service: TimeDebtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeDebtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
