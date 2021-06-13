import { Expect, Equal } from '../src/types/helpers';
import { match, __, isString } from '../src';

describe('Map', () => {
  it('should match Map patterns', () => {
    const usersMap = new Map([
      ['gab', { name: 'gabriel' }],
      ['angégé', { name: 'angéline' }],
    ]);

    const userPattern = { name: isString };

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
