import { match, P } from '../src';

for (const name of [
  'constructor',
  'toString',
  'hasOwnProperty',
  '__proto__',
] as const) {
  describe(`selection named ${name}`, () => {
    it('selects a scalar as an own property', () => {
      const selected = match(42)
        .with(P.select(name), (value) => value)
        .run();
      expect(Object.prototype.hasOwnProperty.call(selected, name)).toBe(true);
      expect(selected[name]).toBe(42);
      expect(Object.getPrototypeOf(selected)).toBe(Object.prototype);
    });

    it('collects array elements', () => {
      const selected = match([1, 2])
        .with(P.array(P.select(name)), (value) => value)
        .run();
      expect(selected[name]).toEqual([1, 2]);
    });

    it('collects set elements', () => {
      const selected = match(new Set([1, 2]))
        .with(P.set(P.select(name)), (value) => value)
        .run();
      expect(selected[name]).toEqual([1, 2]);
    });

    it('collects map values', () => {
      const selected = match(
        new Map([
          ['a', 1],
          ['b', 2],
        ])
      )
        .with(P.map(P.string, P.select(name)), (value) => value)
        .run();
      expect(selected[name]).toEqual([1, 2]);
    });
  });
}

it('preserves a nested prototype-named selection inside another selection', () => {
  const selected = match({ field: 42 })
    .with(P.select('whole', { field: P.select('__proto__') }), (value) => value)
    .run();
  expect(Object.prototype.hasOwnProperty.call(selected, '__proto__')).toBe(
    true
  );
  expect(selected.__proto__).toBe(42);
  expect(selected.whole).toEqual({ field: 42 });
});
