import { isMatching, match, P } from '../src';
import { DeepExclude } from '../src/types/DeepExclude';
import { DistributeMatchingUnions } from '../src/types/DistributeUnions';
import { IsMatching } from '../src/types/IsMatching';
import { Equal, Expect, Fn } from '../src/types/helpers';

describe('matcher protocol', () => {
  type OptionValue<T> = T extends Some<infer V> ? V : never;
  interface SomeNarrowFn<p extends P.Pattern<unknown> = never> extends Fn {
    return: [p] extends [never]
      ? Some<OptionValue<this['arg0']>>
      : Some<P.narrow<OptionValue<this['arg0']>, p>>;
  }

  class Some<T> {
    constructor(private value: T) {}
    static pattern<input, pattern extends P.Pattern<OptionValue<input>>>(
      pattern: pattern
    ) {
      return {
        [P.matcher](): P.Matcher<SomeNarrowFn<pattern>, input, pattern> {
          return {
            match: (input) => {
              if (input instanceof Some && isMatching(pattern, input)) {
                return { matched: true, value: input.value };
              }
              return { matched: false };
            },
          };
        },
      };
    }
    static [P.matcher](): P.Matcher<SomeNarrowFn> {
      return {
        match: (input) => {
          if (input instanceof Some) {
            return { matched: true, value: input.value };
          }
          return { matched: false };
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

  match<{ option: Option<number | string> }>({ option: new Some(12) }).with(
    { option: Some.pattern(10) },
    (value) => {
      type t = Expect<Equal<typeof value, { option: Some<10> }>>;
    }
  );

  match<{ option: Option<number | string> }>({ option: new Some(12) }).with(
    { option: Some.pattern(10) },
    (value) => {
      type t = Expect<Equal<typeof value, { option: Some<10> }>>;
    }
  );

  match<{ option: Option<number | string> }>({ option: new Some(12) }).with(
    { option: Some },
    (value) => {
      type t = Expect<Equal<typeof value, { option: Some<number | string> }>>;
    }
  );
  match<{ option: Option<number | string> }>({ option: new Some(12) }).with(
    { option: None },
    (value) => {
      type t = Expect<Equal<typeof value, { option: None }>>;
    }
  );

  type test1 = DeepExclude<
    //   ^?
    { option: Option<number | string> },
    { option: Some<number | string> }
  >;

  type test2 = DistributeMatchingUnions<
    //   ^?
    { option: Option<number | string> },
    { option: Some<number | string> }
  >;

  // ❌ should be true. Need to check.
  type test3 = IsMatching<
    //   ^?
    { option: Option<number | string> },
    { option: Some<number | string> }
  >;

  type test4 = IsMatching<
    //   ^?
    Some<number | string>,
    Some<number | string>
  >;

  match<{ option: Option<number | string> }>({ option: new Some(12) })
    .with({ option: Some }, (value) => {
      type t = Expect<Equal<typeof value, { option: Some<number | string> }>>;
    })
    .with({ option: None }, (x) => 'none')
    .exhaustive();

  match<Option<number | string>>(new Some(12)).with(
    Some.pattern(10),
    (value) => {
      type t = Expect<Equal<typeof value, Some<10>>>;
    }
  );

  match<Option<number | string>>(new Some(12)).with(
    Some.pattern(P.number),
    (value) => {
      type t = Expect<Equal<typeof value, Some<number>>>;
    }
  );

  match<Option<number | string>>(new Some(12)).with(None, (value) => {
    type t = Expect<Equal<typeof value, None>>;
  });

  match<Option<number | string>>(new Some(12))
    .with(Some, (value) => {
      type t = Expect<Equal<typeof value, Some<number | string>>>;
    })
    .with(None, () => '')
    .exhaustive();
});
