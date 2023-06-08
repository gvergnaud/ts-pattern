import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { Option } from './types-catalog/utils';

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
      // @ts-expect-error
      .exhaustive();

    match<Country>('Germany')
      .with('Germany', 'Spain', () => 'Europe')
      // @ts-expect-error: 'US' instead of 'USA'
      .with('US', (x) => 'America')
      // @ts-expect-error
      .exhaustive();
  });

  it("If the pattern's wrong, the inferred selection must be the input type", () => {
    match<Country>('Germany')
      .with('Germany', 'Spain', () => 'Europe')
      // @ts-expect-error: 'US' instead of 'USA'
      .with('US', (x) => {
        type t = Expect<Equal<typeof x, 'France' | 'USA'>>;
        return 'America';
      })
      // @ts-expect-error
      .exhaustive();
  });

  it("Patterns shouldn't accept values which will never match", () => {
    const f1 = (input: Option<{ x: number }>) =>
      match<Option<{ x: number }>>(input)
        .with({ kind: 'some', value: { x: 2 } }, () => '2')
        // @ts-expect-error, value.x should be a number
        .with({ value: { x: '' } }, () => '2')
        .with({ kind: 'none' }, () => '')
        .with({ kind: 'some' }, () => '')
        .exhaustive();

    const f2 = (input: Option<number>) =>
      match(input)
        // @ts-expect-error: value is a number
        .with({ kind: 'some', value: 'string' }, () => '')
        .with({ kind: 'none' }, () => '')
        .with({ kind: 'some' }, () => '')
        .exhaustive();
  });

  it("shouldn't allow when guards with an invalid input", () => {
    const startsWith = (start: string) => (value: string) =>
      value.startsWith(start);

    const equals =
      <T>(n: T) =>
      (n2: T) =>
        n === n2;

    const f = (optionalNumber: Option<number>) =>
      match(optionalNumber)
        .with(
          {
            kind: 'some',
            // @ts-expect-error: string isn't assigable to number
            value: P.when(startsWith('hello')),
          },
          () => 'fizz'
        )
        .with(
          {
            kind: 'some',
            // @ts-expect-error: string isn't assigable to number
            value: P.when((x: string) => x),
          },
          () => 'fizz'
        )
        .with(
          {
            kind: 'some',
            value: P.when((x: number) => x),
          },
          () => 'fizz'
        )
        .with(
          {
            kind: 'some',
            value: P.when(equals(2)),
          },
          () => 'fizz'
        )
        .with(
          {
            kind: 'some',
            // @ts-expect-error: string isn't assigable to number
            value: P.when(equals('yo')),
          },
          () => 'fizz'
        )
        .with({ kind: 'none' }, () => 'nope')
        // @ts-expect-error
        .exhaustive();
  });

  it("if a pattern is any, the outer expression shouldn't throw a type error", () => {
    const anyVar = null as any;

    match({ a: 'a' })
      .with({ a: anyVar }, (x) => {
        type t = Expect<Equal<typeof x, { a: never }>>;
        return 'Ok';
      })
      .otherwise(() => 'ko');
  });
});
