import { isMatching, match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('matcher protocol', () => {
  type SomeValue<T> = T extends Some<infer V> ? V : never;

  interface SomeNarrowFn extends P.unstable_Fn {
    output: Some<SomeValue<this['input']>>;
  }

  class Some<const T> {
    constructor(public value: T) {}

    static [P.matcher](): P.unstable_Matcher<SomeNarrowFn> {
      return {
        match: (input) => ({
          matched: input instanceof Some,
        }),
      };
    }

    [P.matcher](): P.unstable_Matcher<
      Some<T extends P.Pattern<unknown> ? P.infer<T> : T>
    > {
      return {
        match: (input) => {
          return {
            matched:
              input instanceof Some &&
              isMatching<any, any>(this.value, input.value),
          };
        },
      };
    }
  }

  class None {
    coucou: number;
    constructor() {
      this.coucou = 1;
    }
    static [P.matcher](): P.unstable_Matcher<None> {
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
