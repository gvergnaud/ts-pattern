import { isMatching, match, P } from '../src';
import { DeepExclude } from '../src/types/DeepExclude';
import { MatcherFunction, UnknownPattern } from '../src/types/Pattern';
import { Equal, Expect } from '../src/types/helpers';

describe('matcher protocol', () => {
  type ExtractSomeValue<Input> = Input extends Some<infer V> ? V : never;

  interface SomeMatcherFunction extends MatcherFunction {
    output: ExtractSomeValue<this['input']>;
  }

  class Some<T> {
    constructor(private value: T) {}

    static pattern<Input, const Pattern extends P.Pattern<Input>>(pattern: Pattern) {
      interface SomePatternMatcherFunction extends MatcherFunction {
        output: P.infer<Pattern>;
      }
      
      return {
        [P.matcher](): P.Matcher<SomePatternMatcherFunction> {
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

    static [P.matcher](): P.Matcher<SomeMatcherFunction> {
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

  interface NoneMatcherFunction extends MatcherFunction {
    output: None;
  }

  class None {
    coucou: number;

    constructor() {
      this.coucou = 1;
    }

    static [P.matcher](): P.Matcher<NoneMatcherFunction> {
      return {
        match: (input) => {
          return { matched: input instanceof None };
        },
      };
    }
  }

  type Option<T> = Some<T> | None;

  const x = Some.pattern(10);
  const x2 = Some.pattern(P.number);

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
    .exhaustive();
});
