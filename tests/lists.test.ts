import { match, __ } from '../src';
import { Option, NotNever, Blog } from './utils';

describe('List ([a])', () => {
  it('should match list patterns', () => {
    let httpResult = {
      id: 20,
      title: 'hellooo',
    };
    const res = match<any, Option<Blog[]>>([httpResult])
      .with([], (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: never[] = x;
        return { kind: 'some', value: [{ id: 0, title: 'LOlol' }] };
      })
      .with([{ id: __.number, title: __.string }], (blogs) => {
        const notNever: NotNever<typeof blogs> = true;
        const inferenceCheck: { id: number; title: string }[] = blogs;
        return {
          kind: 'some',
          value: blogs,
        };
      })
      .with(20, (x) => {
        const notNever: NotNever<typeof x> = true;
        const inferenceCheck: number = x;
        return { kind: 'none' };
      })
      .otherwise(() => ({ kind: 'none' }));

    expect(res).toEqual({ kind: 'some', value: [httpResult] });
  });
});
