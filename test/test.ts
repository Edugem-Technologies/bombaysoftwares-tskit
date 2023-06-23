import { expect } from 'chai';

describe('Example Test Suite', function() {
  it('should pass this test', function() {
    expect(2 + 2).to.equal(4);
  });

  it('should fail this test', function() {
    expect(5 * 5).to.equal(25);
  });
});
