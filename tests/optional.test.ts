import { match, not, optional, select, __ } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('optional', () => {
  it('should match even if the sub pattern is undefined', () => {
    type Input = { a?: 'cool' } | { b: 'lol' };

    const f = (input: Input) =>
      match(input)
        .with({ b: 'lol' }, (x) => {
          return false;
        })
        .with({ a: optional('cool') }, (x) => {
          return true;
        })
        .exhaustive();

    expect(f({})).toBe(true);
    expect(f({ a: 'cool' })).toBe(true);
    expect(f({ b: 'lol' })).toBe(false);
  });

  it('should support a nested pattern', () => {
    type Input = { a?: { name: string; age: number } } | { b: '' };

    expect(
      match<Input>({})
        .with({ a: optional({ name: 'Hello' }) }, (x) => {
          return true;
        })
        .with({ b: __.string }, (x) => {
          return false;
        })
        .with({ a: undefined }, (x) => {
          return false;
        })
        .with(__, (x) => {
          return false;
        })
        .exhaustive()
    ).toBe(true);
  });

  it('should support anonymous select', () => {
    type Input = { a?: { name: string; age: number } } | { b: '' };

    expect(
      match<Input>({})
        .with({ a: optional({ name: select() }) }, (x) => {
          type t = Expect<Equal<typeof x, string | undefined>>;
          return x;
        })
        .with({ a: optional(select()) }, (x) => {
          type t = Expect<
            Equal<typeof x, { name: string; age: number } | undefined>
          >;
          return x;
        })
        .with({ b: __.string }, (x) => {
          return '1';
        })
        .with({ a: undefined }, (x) => {
          return '1';
        })
        .with({ a: not(undefined) }, (x) => {
          return '1';
        })
        .exhaustive()
    ).toBe(undefined);
  });

  it('should support named select', () => {
    type Input = { a?: { name: string; age: number } } | { b: 'b' };

    expect(
      match<Input>({})
        .with(
          { a: optional({ name: select('name'), age: select('age') }) },
          ({ name, age }) => {
            type t1 = Expect<Equal<typeof name, string | undefined>>;
            type t2 = Expect<Equal<typeof age, number | undefined>>;
            return name;
          }
        )
        .with({ b: 'b' }, (x) => {
          return '1';
        })
        .with({ a: undefined }, (x) => {
          return '1';
        })
        .with({ a: not(undefined) }, (x) => {
          return '1';
        })
        .exhaustive()
    ).toBe(undefined);
  });

  it('should support named select', () => {
    type Input =
      | {
          type: 'a';
          data?: { type: 'img'; src: string } | { type: 'text'; p: string };
        }
      | {
          type: 'b';
          data?: { type: 'video'; src: number } | { type: 'gif'; p: string };
        };

    expect(
      match<Input>({ type: 'a', data: { type: 'text', p: 'paragraph' } })
        .with(
          {
            type: 'a',
            data: optional({ type: 'img' as const }),
          },
          (string) => {
            return string;
          }
        )
        .with(
          {
            type: 'a',
            data: optional({ type: 'text' as const, p: select() }),
          },
          (p) => {
            return p;
          }
        )
        .with(
          {
            type: 'b',
            data: optional({ type: 'video' as const, src: select() }),
          },
          (p) => {
            return p;
          }
        )
        .with(
          {
            type: 'b',
            data: optional({ type: 'gif' as const, p: select() }),
          },
          (p) => {
            return p;
          }
        )
        .exhaustive()
    ).toBe(undefined);
  });
});
