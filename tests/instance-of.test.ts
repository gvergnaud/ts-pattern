import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

class A {
  a = 'a';
}
class B {
  b = 'b';
}

describe('instanceOf', () => {
  it('should work at the top level', () => {
    const get = (x: A | B): string =>
      match(x)
        .with(P.instanceOf(A), (x) => {
          type t = Expect<Equal<typeof x, A>>;
          return 'instance of A';
        })
        .with(P.instanceOf(B), (x) => {
          type t = Expect<Equal<typeof x, B>>;
          return 'instance of B';
        })
        .exhaustive();

    expect(get(new A())).toEqual('instance of A');
    expect(get(new B())).toEqual('instance of B');
  });

  it('should work as a nested pattern', () => {
    type Input = { value: A | B };

    const input = { value: new A() };

    const output = match<Input>(input)
      .with({ value: P.instanceOf(A) }, (a) => {
        type t = Expect<Equal<typeof a, { value: A }>>;
        return 'instance of A!';
      })
      .with({ value: P.instanceOf(B) }, (b) => {
        type t = Expect<Equal<typeof b, { value: B }>>;
        return 'instance of B!';
      })
      .exhaustive();

    expect(output).toEqual('instance of A!');
  });

  it('issue #63: should work on union of errors', () => {
    class FooError extends Error {
      constructor(public foo?: string) {
        super();
      }
    }

    class BazError extends Error {
      constructor(public baz?: string) {
        super();
      }
    }

    type Input = FooError | BazError | Error;

    let err: Input = new FooError('foo');

    expect(
      match<Input, string | undefined>(err)
        .with(P.instanceOf(FooError), (err) => err.foo)
        .with(P.instanceOf(BazError), (err) => err.baz)
        .otherwise(() => 'nothing')
    ).toBe('foo');
  });
});
