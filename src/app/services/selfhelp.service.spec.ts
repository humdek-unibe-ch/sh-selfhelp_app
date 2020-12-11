import { TestBed } from '@angular/core/testing';

import { SelfhelpService } from './selfhelp.service';

describe('SelfhelpService', () => {
  let service: SelfhelpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelfhelpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
