import { Expect, Equal } from '../src/types/helpers';
import { match, __, not } from '../src';
import { Blog } from './utils';

describe('wildcards', () => {
  it('should match String wildcards', () => {
    const res = match<string | number | boolean | null | undefined>('')
      .with(__.string, (x) => {
        type t = Expect<Equal<typeof x, string>>;
        return true;
      })
      .otherwise(() => false);

    expect(res).toEqual(true);
  });

  it('should match Number wildcards', () => {
    const res = match<string | number | boolean | null | undefined>(2)
      .with(__.number, (x) => {
        type t = Expect<Equal<typeof x, number>>;
        return true;
      })
      .otherwise(() => false);

    expect(res).toEqual(true);
  });

  it('should match Boolean wildcards', () => {
    const res = match<string | number | boolean | null | undefined>(true)
      .with(__.boolean, (x) => {
        type t = Expect<Equal<typeof x, boolean>>;
        return true;
      })
      .otherwise(() => false);

    expect(res).toEqual(true);
  });

  it('should match Unit wildcards', () => {
    const res = match<string | number | boolean | null | undefined>(null)
      .with(__.empty, (x) => {
        type t = Expect<Equal<typeof x, null | undefined>>;
        return true;
      })
      .otherwise(() => false);

    const res2 = match<string | number | boolean | null | undefined>(undefined)
      .with(__.empty, (x) => {
        type t = Expect<Equal<typeof x, null | undefined>>;
        return true;
      })
      .otherwise(() => false);

    expect(res).toEqual(true);
    expect(res2).toEqual(true);
  });

  it('should match String, Number and Boolean wildcards', () => {
    // Will be { id: number, title: string } | { errorMessage: string }
    let httpResult = {
      id: 20,
      title: 'hellooo',
    }; /* API logic. */

    const res = match<any, Blog | Error>(httpResult)
      .with({ id: __.number, title: __.string }, (r) => ({
        id: r.id,
        title: r.title,
      }))
      .with({ errorMessage: __.string }, (r) => new Error(r.errorMessage))
      .otherwise(() => new Error('Client parse error'));

    expect(res).toEqual({
      id: 20,
      title: 'hellooo',
    });
  });

  it('should infer correctly negated String wildcards', () => {
    const res = match<string | number | boolean>('')
      .with(not(__.string), (x) => {
        type t = Expect<Equal<typeof x, number | boolean>>;
        return true;
      })
      .otherwise(() => false);

    expect(res).toEqual(false);
  });

  it('should infer correctly negated Number wildcards', () => {
    const res = match<string | number | boolean>(2)
      .with(not(__.number), (x) => {
        type t = Expect<Equal<typeof x, string | boolean>>;
        return true;
      })
      .otherwise(() => false);

    expect(res).toEqual(false);
  });

  it('should infer correctly negated Boolean wildcards', () => {
    const res = match<string | number | boolean>(true)
      .with(not(__.boolean), (x) => {
        type t = Expect<Equal<typeof x, string | number>>;
        return true;
      })
      .otherwise(() => false);

    expect(res).toEqual(false);
  });

  describe('catch all', () => {
    const allValueTypes = [
      undefined,
      null,
      Symbol(2),
      2,
      'string',
      true,
      () => {},
      {},
      [],
      new Map(),
      new Set(),
    ];

    allValueTypes.forEach((value) => {
      it(`should match ${typeof value} values`, () => {
        expect(
          match(value)
            .with(__, () => 'yes')
            .run()
        ).toEqual('yes');
      });
    });
  });
});
