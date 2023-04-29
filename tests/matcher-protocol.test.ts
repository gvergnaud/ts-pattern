import { isMatching, match, P } from '../src';
import { Equal, Expect, Fn } from '../src/types/helpers';

describe('matcher protocol', () => {
  type ExtractSomeValue<Input> = Input extends Some<infer V> ? V : never;
  interface SomeNarrowFn extends Fn {
    return: ExtractSomeValue<this['arg0']>;
  }
  interface Constant<T> extends Fn {
    return: T;
  }
  class Some<T> {
    constructor(private value: T) {}
    static pattern<Input, const Pattern extends P.Pattern<Input>>(pattern: Pattern) {
      interface SomeNarrowFn extends Fn {
        return: P.infer<Pattern>
      }
      return {
        [P.matcher](): P.Matcher<{ narrow: SomeNarrowFn, select: Constant<never>  }> {
          return {
            match: (input) => {
              if (input instanceof Some && isMatching(pattern, input)) {
                return { matched: true, value: input.value };
              }
              return { matched: false };
            },
          };
        },
      } as P.Matchable<{ narrow: SomeNarrowFn, select: Constant<never>  }>;
    }
    static [P.matcher](): P.Matcher<{ narrow: SomeNarrowFn, select: Constant<never> }> {
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
    static [P.matcher](): P.Matcher<{ narrow: NoneNarrowFn, select: Constant<never> }> {
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
      type t = Expect<Equal<typeof value, { option: 10 }>>;
    }
  );
  match<{ option: Option<number | string> }>({ option: new Some(12) }).with(
    { option: Some },
    (value) => {
      type t = Expect<Equal<typeof value, { option: number | string }>>;
    }
  );
  match<{ option: Option<number | string> }>({ option: new Some(12) }).with(
    { option: None },
    (value) => {
      type t = Expect<Equal<typeof value, { option: None }>>;
    }
  );
  match<{ option: Option<number | string> }>({ option: new Some(12) })
    .with({ option: Some }, (value) => {
      type t = Expect<Equal<typeof value, { option: number | string }>>;
    })
    .with({ option: None }, () => "none")
    .exhaustive();
  match<Option<number | string>>(new Some(12)).with(
    Some.pattern(10),
    (value) => {
      type t = Expect<Equal<typeof value, 10>>;
    }
  );
  match<Option<number | string>>(new Some(12)).with(
    Some.pattern(P.number),
    (value) => {
      type t = Expect<Equal<typeof value, number>>;
    }
  );
  match<Option<number | string>>(new Some(12)).with(None, (value) => {
    type t = Expect<Equal<typeof value, None>>;
  });
  match<Option<number | string>>(new Some(12))
    .with(Some, (value) => {
      type t = Expect<Equal<typeof value, number | string>>;
    })
    .with(None, () => '')
    .exhaustive();
});
