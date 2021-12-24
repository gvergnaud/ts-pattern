import { Expect, Equal } from '../src/types/helpers';
import { match, __, P } from '../src';

describe('Map', () => {
  it('should match Map patterns', () => {
    const usersMap = new Map([
      ['gab', { name: 'gabriel' }],
      ['angégé', { name: 'angéline' }],
    ]);

    const userPattern = { name: P.string };

    const res = match<Map<string, { name: string }>>(usersMap)
      .with(
        new Map([
          ['angégé' as const, userPattern],
          ['gab' as const, userPattern],
        ]),
        (map) => ({
          name: map.get('angégé')!.name + ' ' + map.get('gab')!.name,
        })
      )
      .with(
        new Map([['angégé' as const, userPattern]]),
        (map) => map.get('angégé')!
      )
      .with(new Map([['gab' as const, userPattern]]), (map) => map.get('gab')!)
      .with(__, () => ({ name: 'unknown' }))
      .run();

    type t = Expect<Equal<typeof res, { name: string }>>;

    expect(res).toEqual({ name: 'angéline gabriel' });
  });
});
