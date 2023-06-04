import { match, P } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import {
  AsyncResult,
  AsyncResultError,
  AsyncResultSuccess,
  none,
  Option,
  some,
} from './types-catalog/utils';

describe('generics', () => {
  type State<T> =
    | { t: 'success'; value: T }
    | { t: 'error'; error: Error }
    | { t: 'loading' };

  it('should have basic support for objects containing generics', () => {
    const f = <T>(input: State<T>) => {
      return match(input)
        .with({ t: 'success' }, (x) => {
          type t = Expect<Equal<typeof x, { t: 'success'; value: T }>>;
          return 'success!';
        })
        .with({ t: 'error' }, (x) => {
          type t = Expect<Equal<typeof x, { t: 'error'; error: Error }>>;
          return 'error :(';
        })
        .with({ t: 'loading' }, (x) => {
          type t = Expect<Equal<typeof x, { t: 'loading' }>>;
          return 'loading...';
        })
        .exhaustive();
    };
  });

  it('should have basic support for arrays containing generics', () => {
    const last = <a>(xs: a[]) =>
      match<a[], Option<a>>(xs)
        .with([], () => none)
        .with(P._, (x, y) => {
          type t = Expect<Equal<typeof x, a[]>>;
          type t2 = Expect<Equal<typeof y, a[]>>;
          return some(xs[xs.length - 1]);
        })
        .exhaustive();
  });

  it('should have basic support for tuples containing generics', () => {
    type State<T> = { t: 'success'; value: T } | { t: 'error'; error: Error };

    const f = <a, b>(xs: [State<a>, State<b>]) =>
      match(xs)
        .with([{ t: 'success' }, { t: 'success' }], ([x, y]) => {
          type t = Expect<Equal<typeof x, { t: 'success'; value: a }>>;
          type t2 = Expect<Equal<typeof y, { t: 'success'; value: b }>>;
          return 'success!';
        })
        .with([{ t: 'success' }, { t: 'error' }], ([x, y]) => {
          type t = Expect<Equal<typeof x, { t: 'success'; value: a }>>;
          type t2 = Expect<Equal<typeof y, { t: 'error'; error: Error }>>;
          return 'success!';
        })
        .with([{ t: 'error' }, P._], ([x, y]) => {
          type t = Expect<Equal<typeof x, { t: 'error'; error: Error }>>;
          type t2 = Expect<Equal<typeof y, State<b>>>;
          return 'error :(';
        })
        .exhaustive();
  });

  it('Basic generic type guards (with no type level manipulation of the input) should work', () => {
    const isSuccess = <T>(x: any): x is { t: 'success'; value: T } =>
      Boolean(x && typeof x === 'object' && x.t === 'success');

    const isDoubleSuccess = <T>(x: any): x is { t: 'success'; value: [T, T] } =>
      Boolean(
        x &&
          typeof x === 'object' &&
          x.t === 'success' &&
          Array.isArray(x.value) &&
          x.value.length === 2
      );

    const f = <T>(input: State<[number, number] | number>) => {
      return match({ input })
        .with({ input: P.when(isSuccess) }, (x) => {
          type t = Expect<
            Equal<
              typeof x,
              { input: { t: 'success'; value: number | [number, number] } }
            >
          >;
          return 'ok';
        })
        .with({ input: P.when(isDoubleSuccess) }, (x) => {
          type t = Expect<
            Equal<
              typeof x,
              { input: { t: 'success'; value: [number, number] } }
            >
          >;
          return 'ok';
        })
        .otherwise(() => 'nope');
    };
  });

  it("shouldn't get stucked on type parameters if they aren't included in the pattern", () => {
    const fn = <TResult, TError>(result: AsyncResult<TResult, TError>) => {
      return match(result)
        .with({ status: 'success' }, (x) => {
          type test = Expect<
            Equal<typeof x, AsyncResultSuccess<TResult, TError>>
          >;
        })
        .with({ status: 'error' }, (x) => {
          type test = Expect<
            Equal<typeof x, AsyncResultError<TResult, TError>>
          >;
        })
        .with({ status: 'loading' }, (x) => {
          type test = Expect<
            Equal<
              typeof x,
              {
                status: 'loading';
                error?: TError | undefined;
                data?: TResult | undefined;
              }
            >
          >;
        })
        .with({ status: 'idle' }, (x) => {
          type test = Expect<
            Equal<
              typeof x,
              {
                status: 'idle';
                error?: TError | undefined;
                data?: TResult | undefined;
              }
            >
          >;
        })
        .exhaustive();
    };
  });
});
