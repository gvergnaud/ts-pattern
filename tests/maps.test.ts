import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

describe('Map', () => {
  it('selects empty key and value arrays from an empty Map', () => {
    const input = new Map<string, number>();
    const result = match(input)
      .with(
        P.map(P.select('keys', P.string), P.select('values', P.number)),
        (selection) => {
          type t = Expect<
            Equal<typeof selection, { keys: string[]; values: number[] }>
          >;
          return selection;
        }
      )
      .exhaustive();

    expect(result).toEqual({ keys: [], values: [] });
    expect(
      match(input)
        .with(P.map(), (value) => value)
        .exhaustive()
    ).toBe(input);
  });

  it('selects an empty array from either side of an empty Map', () => {
    const input = new Map<string, number>();
    const keys = match(input)
      .with(P.map(P.select(P.string), P.number), (selection) => selection)
      .exhaustive();
    const values = match(input)
      .with(P.map(P.string, P.select(P.number)), (selection) => selection)
      .exhaustive();

    type keysType = Expect<Equal<typeof keys, string[]>>;
    type valuesType = Expect<Equal<typeof values, number[]>>;
    expect(keys).toEqual([]);
    expect(values).toEqual([]);
  });

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
});
