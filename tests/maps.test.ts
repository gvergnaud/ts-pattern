import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';

describe('Map', () => {
  it('should match Map patterns', () => {
    const usersMap = new Map([
      ['gab', { name: 'gabriel' }],
      ['angégé', { name: 'angéline' }],
    ]);

    const userPattern = { name: P.string };

    const res = match<Map<string, { name: string }>>(usersMap)
      .with(P.map(P.union('angégé', 'gab'), userPattern), (map) => ({
        name: map.get('angégé')!.name + ' ' + map.get('gab')!.name,
      }))
      .with(P.map('angégé', userPattern), (map) => map.get('angégé')!)
      .with(P._, () => ({ name: 'unknown' }))
      .run();

    type t = Expect<Equal<typeof res, { name: string }>>;

    expect(res).toEqual({ name: 'angéline gabriel' });
  });
});
