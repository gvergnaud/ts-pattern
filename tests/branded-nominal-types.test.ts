import { match, P } from '../src';

describe('Branded strings', () => {
  type BrandedId = string & { __brand: 'brandId' };
  type FooBar = { type: 'foo'; id: BrandedId; value: string } | { type: 'bar' };
  type State = {
    fooBar: FooBar;
    fooBarId: BrandedId;
  };

  it('should treat branded strings as default string, and not as objects', () => {
    const state: State = {
      fooBar: { type: 'foo', id: '' as BrandedId, value: 'value' },
      fooBarId: '' as BrandedId,
    };

    expect(
      match(state)
        .with(
          { fooBar: { type: 'foo' }, fooBarId: P.when((id) => id === '') },
          (x) => `Match: ${x.fooBar.value}`
        )
        .otherwise(() => 'nope')
    ).toEqual('Match: value');
  });

  it('issue #167', () => {
    const tag: unique symbol = Symbol();
    type Tagged<Token> = { readonly [tag]: Token };
    type Opaque<Type, Token = unknown> = Type & Tagged<Token>;

    const opaqueString = (Math.random() > 0.5 ? 'A' : 'B') as Opaque<'A' | 'B'>;

    match(opaqueString)
      .with('A' as Opaque<'A'>, () => 1)
      .with('B' as Opaque<'B'>, () => 2)
      .exhaustive();
  });

  it('issue #178', () => {
    const symbol: unique symbol = Symbol();

    interface Branded<key extends string> {
      [symbol]: { [k in key]: true };
    }

    type Brand<a, key extends string> = a & Branded<key>;
    type BrandId = Brand<number, 'BrandId'>;

    const a: number = 1;
    const b: BrandId = 1 as BrandId;

    expect(
      match({ a, b })
        .with({ a, b }, () => '1')
        .with({ a: P.number, b: P.number }, () => '2')
        .exhaustive()
    ).toEqual('1');
  });
});
