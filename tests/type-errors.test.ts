import { match, when, __ } from '../src';
import { Equal, Expect } from '../src/types/helpers';

type Country = 'France' | 'Germany' | 'Spain' | 'USA';

describe('type errors', () => {
  it("if the inferred pattern type is any, it shouldn't say that the type instanciation is too deep.", () => {
    const f = (n: number) => {
      return (
        match(n)
          // @ts-expect-error: this isn't a list
          .with([__.listOf, __.number], (s) => {
            return 'big number';
          })
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

    match<{ country: Country }>({ country: 'France' })
      .with(
        // @ts-expect-error: 'Spai' instead of 'Spain'
        { country: [__.oneOf, 'France', 'Germany', 'Spai'] },
        () => 'Europe'
      )
      .with({ country: 'USA' }, () => 'America')
      .exhaustive();

    match<{ country: Country }>({ country: 'Germany' })
      .with({ country: [__.oneOf, 'Germany', 'Spain'] }, () => 'Europe')
      // @ts-expect-error: 'US' instead of 'USA'
      .with({ country: 'US' }, () => 'America')
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
});
