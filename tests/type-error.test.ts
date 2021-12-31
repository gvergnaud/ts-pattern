import { match, __, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { Option } from './utils';

type Country = 'France' | 'Germany' | 'Spain' | 'USA';

describe('type errors', () => {
  it("if the inferred pattern type is any, it shouldn't say that the type instanciation is too deep.", () => {
    const f = (n: number) => {
      return (
        match(n)
          .with(P.array(P.number), (s) => {
            return 'big number';
          })
          // @ts-expect-error: this isn't a list
          .exhaustive()
      );
    };

    match<Country>('France')
      // @ts-expect-error: 'Spai' instead of 'Spain'
      .with('France', 'Germany', 'Spai', (x) => 'Europe')
      .with('USA', () => 'America')
      .exhaustive();

    match<Country>('Germany')
      .with('Germany', 'Spain', () => 'Europe')
      // @ts-expect-error: 'US' instead of 'USA'
      .with('US', (x) => 'America')
      .exhaustive();
  });

  it("If the pattern's wrong, the infered selection must be the input type", () => {
    match<Country>('Germany')
      .with('Germany', 'Spain', () => 'Europe')
      // @ts-expect-error: 'US' instead of 'USA'
      .with('US', (x) => {
        type t = Expect<Equal<typeof x, Country>>;
        return 'America';
      })
      .exhaustive();
  });

  it("Patterns shouldn't accept values which will never match", () => {
    const f1 = (input: Option<{ x: number }>) =>
      match<Option<{ x: number }>>(input)
        .with({ kind: 'some', value: { x: 2 } }, () => '2')
        // @ts-expect-error, value.x should be a number
        .with({ value: { x: '' } }, () => '2')
        .with({ kind: 'some' }, () => '2')
        .with({ kind: 'none' }, () => '')
        .with({ kind: 'some', value: P.__ }, () => '')
        .exhaustive();

    const f2 = (input: Option<number>) =>
      match(input)
        // @ts-expect-error: value is a number
        .with({ kind: 'some', value: 'string' }, () => '')
        .with({ kind: 'none' }, () => 0)
        .exhaustive();
  });
});