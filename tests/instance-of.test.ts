import { Expect, Equal } from '../src/types/helpers';
import { match, __, instanceOf } from '../src';

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
        .with(instanceOf(A), (x) => {
          type t = Expect<Equal<typeof x, A>>;
          return 'instance of A';
        })
        .with(instanceOf(B), (x) => {
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
      .with({ value: instanceOf(A) }, (a) => {
        type t = Expect<Equal<typeof a, { value: A }>>;
        return 'instance of A!';
      })
      .with({ value: instanceOf(B) }, (b) => {
        type t = Expect<Equal<typeof b, { value: B }>>;
        return 'instance of B!';
      })
      .exhaustive();

    expect(output).toEqual('instance of A!');
  });
});
