import { Expect, Equal } from '../src/types/helpers';
import { P, match } from '../src';

describe('Object', () => {
  it('should match exact object', () => {
    const fn = () => 'hello';

    const res = match({ str: fn() })
      .with({ str: 'world' }, (obj) => {
        type t = Expect<Equal<typeof obj, { str: 'world' }>>;
        return obj.str;
      })
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, {
          readonly str: string;
        }>>;
        return 'not found';
      })
      .exhaustive();
    expect(res).toEqual('not found');
  });

  it('when input is a Function, it should not match as an exact object', () => {
    const fn = () => () => {};

    const res = match(fn())
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, () => void>>;
        return 'not found';
      })
      .otherwise(() => 'not found');
    expect(res).toEqual('not found');
  })

  it('when input is a Number (a primitive value), it should not be matched as an exact object', () => {
    const fn = () => 1_000_000;

    const res = match(fn())
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, number>>;
        return 'not found';
      })
      .otherwise(() => 'not found');
    expect(res).toEqual('not found');
  })

  it('when input is a String (a primitive value), it should not be matched as an exact object', () => {
    const fn = () => 'hello';

    const res = match(fn())
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, string>>;
        return 'not found';
      })
      .otherwise(() => 'not found');
    expect(res).toEqual('not found');
  })

  it('when input is a Boolean (a primitive value), it should not be matched as an exact object', () => {
    const fn = () => true;

    const res = match(fn())
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, boolean>>;
        return 'not found';
      })
      .otherwise(() => 'not found');
    expect(res).toEqual('not found');
  })

  it('when input is Null, it should not be matched as an exact object', () => {
    const fn = () => null;

    const res = match(fn())
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, null>>;
        return 'not found';
      })
      .otherwise(() => 'not found');
    expect(res).toEqual('not found');
  })

  it('should match object with nested objects', () => {
    const res = match({ x: { y: 1 } })
      .with({ x: { y: 1 } }, (obj) => {
        type t = Expect<Equal<typeof obj, { readonly x: { readonly y: 1 } }>>;
        return 'yes';
      })
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, never>>;
        return 'no';
      })
      .exhaustive();
    expect(res).toEqual('yes');
  });

  it('should match object with nested objects and arrays', () => {
    const res = match({ x: { y: [1] } })
      .with({ x: { y: [1] } }, (obj) => {
        type t = Expect<Equal<typeof obj, { x: { y: [1] } }>>;
        return 'yes';
      })
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, { readonly x: { readonly y: readonly [1]}}>>;
        return 'no';
      })
      .exhaustive();

    expect(res).toEqual('yes');
  });

  it('should match empty object', () => {
    const res = match({})
      .with(P.object.empty(), (obj) => {
        type t = Expect<Equal<typeof obj, {}>>;

        return 'yes';
      })
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, never>>;

        return 'no';
      })
      .exhaustive();
    expect(res).toEqual('yes');
  });

  it('should properly match an object against the P.object pattern, even with optional properties', () => {
    const res = match({ x: 1 })
      .with(P.object.empty(), (obj) => {
        type t = Expect<Equal<typeof obj, { readonly x: 1; }>>;
        return 'no';
      })
      .with(P.object, (obj) => {
        type t = Expect<Equal<typeof obj, never>>;
        return 'yes';
      })
      .exhaustive();
    expect(res).toEqual('yes');
  });
});
