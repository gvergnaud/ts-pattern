import { match, __ } from '../src';
import { NotNever } from './utils';

describe('Map', () => {
  it('should match Map patterns', () => {
    const usersMap = new Map([
      ['gab', { name: 'gabriel' }],
      ['angégé', { name: 'angéline' }],
    ]);

    const userPattern = { name: __.string };

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

    const inferenceCheck: [NotNever<typeof res>, { name: string }] = [
      true,
      res,
    ];

    expect(res).toEqual({ name: 'angéline gabriel' });
  });
});
