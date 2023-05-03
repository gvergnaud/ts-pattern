import * as symbols from '../src/internals/symbols';
import { isMatching, match, P } from '../src';
import { Equal, Expect, Fn } from '../src/types/helpers';
import { UnknownPattern } from '../src/types/Pattern';

describe('matcher protocol', () => {
  type SomeValue<T> = T extends Some<infer V> ? V : never;

  interface SomeNarrowFn<p extends P.Pattern<unknown> = never> extends Fn {
    return: [p] extends [never]
      ? Some<SomeValue<this['arg0']>>
      : Some<P.narrow<SomeValue<this['arg0']>, p>>;
  }

  class Some<const T> {
    constructor(public value: T) {}

    static [P.matcher](): P.Matcher<SomeNarrowFn> {
      return {
        match: (input) => {
          return {
            matched: input instanceof Some,
          };
        },
      };
    }

    [P.matcher](): P.Matcher<SomeNarrowFn<Extract<T, UnknownPattern>>> {
      return {
        match: (input) => {
          return {
            matched:
              input instanceof Some && isMatching<any>(this.value, input.value),
          };
        },
      };
    }
  }
  interface NoneNarrowFn extends Fn {
    return: None;
  }
  class None {
    coucou: number;
    constructor() {
      this.coucou = 1;
    }
    static [P.matcher](): P.Matcher<NoneNarrowFn> {
      return {
        match: (input) => {
          return { matched: input instanceof None };
        },
      };
    }
  }
  type Option<T> = Some<T> | None;

  it('should support taking a sub pattern', () => {
    const res = match<{ option: Option<number | string> }>({
      option: new Some(12),
    })
      .with({ option: new Some(7) }, (value) => {
        type t = Expect<Equal<typeof value, { option: Some<7> }>>;
        return value.option.value;
      })
      .with({ option: new Some(12) }, (value) => {
        type t = Expect<Equal<typeof value, { option: Some<12> }>>;
        return value.option.value;
      })
      .with({ option: None }, () => '')
      .with({ option: Some }, () => '')
      .exhaustive();

    expect(res).toBe(12);

    match<Option<number | string>>(new Some(12)).with(
      new Some(P.number),
      (some) => {
        type t = Expect<Equal<typeof some, Some<number>>>;
      }
    );
  });

  it('should support nesting', () => {
    const res = match<{ option: Option<number | string> }>({
      option: new Some(12),
    })
      .with({ option: Some }, (x) => {
        type t = Expect<Equal<typeof x, { option: Some<number | string> }>>;
        return `Some ${x.option.value}`;
      })
      .with({ option: None }, (x) => {
        type t = Expect<Equal<typeof x, { option: None }>>;
        return 'None';
      })
      .exhaustive();

    expect(res).toBe(`Some 12`);
  });

  it('it should work without nesting too', () => {
    expect(
      match<Option<number | string>>(new Some(12))
        .with(new Some(10), (some) => {
          type t = Expect<Equal<typeof some, Some<10>>>;
          return `10`;
        })
        .with(new Some(12), (some) => `12`)
        .with(new Some(P.any), (some) => `any`)
        .with(None, () => 0)
        .exhaustive()
    ).toBe('12');

    match<Option<number | string>>(new Some(12)).with(
      new Some(P.number),
      (some) => {
        type t = Expect<Equal<typeof some, Some<number>>>;
      }
    );

    match<Option<number | string>>(new Some(12))
      .with(Some, (some) => {
        type t = Expect<Equal<typeof some, Some<number | string>>>;
      })
      .with(None, (none) => {
        type t = Expect<Equal<typeof none, None>>;
      })
      .exhaustive();
  });
});
