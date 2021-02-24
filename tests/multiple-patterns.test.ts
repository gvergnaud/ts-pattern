import { match, not, when, __ } from '../src';
import { Option, some, none, BigUnion } from './utils';

describe('Multiple patterns', () => {
  it('should match if one of the patterns match', () => {
    const testFn = (input: Option<number>) =>
      match(input)
        .exhaustive()
        .with(
          { kind: 'some', value: 2 },
          { kind: 'some', value: 3 },
          { kind: 'some', value: 4 },
          (x) => true
        )
        .with({ kind: 'none' }, { kind: 'some' }, () => false)
        .run();

    const cases = [
      { input: { kind: 'some', value: 3 }, expected: true },
      { input: { kind: 'some', value: 2 }, expected: true },
      { input: { kind: 'some', value: 4 }, expected: true },
      { input: { kind: 'some', value: 5 }, expected: false },
      { input: { kind: 'some', value: -5 }, expected: false },
    ] as const;

    cases.forEach(({ input, expected }) => {
      expect(testFn(input)).toBe(expected);
    });
  });

  it("no patterns shouldn't typecheck", () => {
    const testFn = (input: Option<number>) =>
      match(input)
        .exhaustive()
        .with(
          { kind: 'some', value: 2 },
          { kind: 'some', value: 3 },
          { kind: 'some', value: 4 },
          (x) => true
        )
        .with({ kind: 'none' }, { kind: 'some' }, () => false)
        // @ts-expect-error: Argument of type '() => false' is not assignable to parameter of type 'ExhaustivePattern<Option<number>>'
        .with(() => false)
        .run();
  });
});
