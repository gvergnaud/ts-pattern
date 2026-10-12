import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

describe('Map', () => {
  it('should match Map patterns', () => {
    const usersMap = new Map([
      ['a', { name: 'alice' }],
      ['b', { name: 'bob' }],
    ]);

    const userPattern = { name: P.string };

    const res = match<Map<string, { name: string }>>(usersMap)
      .with(P.map(P.union('b', 'a'), userPattern), (map) => ({
        name: map.get('b')!.name + ' ' + map.get('a')!.name,
      }))
      .with(P.map('b', userPattern), (map) => map.get('b')!)
      .with(P._, () => ({ name: 'unknown' }))
      .run();

    type t = Expect<Equal<typeof res, { name: string }>>;

    expect(res).toEqual({ name: 'bob alice' });
  });

  it("should match any map if P.map isn't given any arguments", () => {
    const usersMap = new Map([
      ['a', { name: 'alice' }],
      ['b', { name: 'bob' }],
    ]);

    const res = match<Map<string, { name: string }>>(usersMap)
      .with(P.map(), () => true)
      .exhaustive();
    type t = Expect<Equal<typeof res, boolean>>;
    expect(res).toEqual(true);
  });
  it('returns empty named key and value selection arrays for an empty map', () => {
    const input = new Map<string, number>();
    const result = match(input)
      .with(
        P.map(P.string.select('keys'), P.number.select('values')),
        (selection) => {
          type t = Expect<
            Equal<typeof selection, { keys: string[]; values: number[] }>
          >;
          return selection;
        }
      )
      .otherwise(() => 'no match');
    expect(result).toEqual({ keys: [], values: [] });
  });

  it('returns an empty anonymous selection array from either side of an empty map', () => {
    const input = new Map<string, number>();
    const keys = match(input)
      .with(P.map(P.string.select(), P.number), (selection) => {
        type t = Expect<Equal<typeof selection, string[]>>;
        return selection;
      })
      .otherwise(() => 'no match');
    expect(keys).toEqual([]);
    const values = match(input)
      .with(P.map(P.string, P.number.select()), (selection) => {
        type t = Expect<Equal<typeof selection, number[]>>;
        return selection;
      })
      .otherwise(() => 'no match');
    expect(values).toEqual([]);
  });
});
