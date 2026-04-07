import { TestBed } from '@angular/core/testing';

import { ModifierGroup } from './modifier-group';

describe('ModifierGroup', () => {
  let service: ModifierGroup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModifierGroup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
