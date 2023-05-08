describe('chainable methods', () => {
  describe('string', () => {
    it(`P.string.includes('str')`, () => {});
    it(`P.string.startsWith('str')`, () => {});
    it(`P.string.endsWith('str')`, () => {});
    it(`P.string.regex('[a-z]+')`, () => {});
  });
  describe('number', () => {
    it(`P.number.between(1, 10)`, () => {});
    it(`P.number.lt(12)`, () => {});
    it(`P.number.gt(12)`, () => {});
    it(`P.number.gte(12)`, () => {});
    it(`P.number.lte(12)`, () => {});
    it(`P.number.int(12)`, () => {});
    it(`P.number.finite(12)`, () => {});
    it(`P.number.positive(12)`, () => {});
    it(`P.number.negative(12)`, () => {});
  });
  describe('all', () => {
    it(`P.number.optional`, () => {});
    it(`P.string.optional`, () => {});
    it(`P.number.select()`, () => {});
    it(`P.string.select()`, () => {});
    it(`P.number.optional.select()`, () => {});
    it(`P.string.optional.select()`, () => {});
  });
});
