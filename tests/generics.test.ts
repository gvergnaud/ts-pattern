import { match, __ } from '../src';
import { Equal, Expect } from '../src/types/helpers';
import { none, Option, some } from './utils';

describe('generics', () => {
  it('should have basic support for objects containing generics', () => {
    type State<T> =
      | { t: 'success'; value: T }
      | { t: 'error'; error: Error }
      | { t: 'loading' };

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
        .otherwise((x) => {
          type t = Expect<Equal<typeof x, a[]>>;
          return some(xs[xs.length - 1]);
        });
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
        .with([{ t: 'error' }, __], ([x, y]) => {
          type t = Expect<Equal<typeof x, { t: 'error'; error: Error }>>;
          type t2 = Expect<Equal<typeof y, State<b>>>;
          return 'error :(';
        })
        .exhaustive();
  });
});
