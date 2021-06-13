import { Expect, Equal } from '../src/types/helpers';
import { match, select, __ } from '../src';

describe('Nesting', () => {
  describe('deeply nested objects', () => {
    it('should work with 4 levels of object nesting', () => {
      type Post = {
        type: 'post';
        id: number;
        content: { body: string; video: Video };
      };
      type Video = { type: 'video'; id: number; content: { src: string } };

      const res = match<Post>({
        type: 'post',
        id: 2,
        content: {
          body: 'yo',
          video: { type: 'video', content: { src: '' }, id: 2 },
        },
      })
        .with(
          {
            type: 'post',
            content: { video: { id: 2, content: { src: '' as string } } },
          },
          (x) => {
            type t = Expect<Equal<typeof x, Post>>;
            return 1;
          }
        )
        .with(__, () => 1)
        .exhaustive();

      type t = Expect<Equal<typeof res, number>>;

      expect(res).toEqual(1);
    });
  });
  describe('objects', () => {
    it('it should work on 2 level', () => {
      expect(
        match({ one: { two: '2', foo: 2, bar: true } })
          .with({ one: { foo: __, bar: __ } }, (x) => x.one.bar)
          .run()
      ).toEqual(true);
    });

    it('it should work on 3 level', () => {
      expect(
        match({ one: { two: { three: '2', foo: 2, bar: true } } })
          .with({ one: { two: { foo: __, bar: __ } } }, (x) => x.one.two.bar)
          .run()
      ).toEqual(true);
    });

    it('it should work on 4 level', () => {
      expect(
        match({ one: { two: { three: { four: '2', foo: 2, bar: true } } } })
          .with(
            { one: { two: { three: { foo: __, bar: __ } } } },
            (x) => x.one.two.three.bar
          )
          .run()
      ).toEqual(true);
    });

    it('it should work on 5 level', () => {
      expect(
        match({
          one: { two: { three: { four: { five: '2', foo: 2, bar: true } } } },
        })
          .with(
            { one: { two: { three: { four: { foo: __, bar: __ } } } } },
            (x) => x.one.two.three.four.bar
          )
          .run()
      ).toEqual(true);
    });

    it('it should work on 9 level', () => {
      expect(
        match({
          one: {
            two: {
              three: {
                four: {
                  five: {
                    six: {
                      seven: {
                        height: {
                          foo: 2,
                          bar: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        })
          .with(
            {
              one: {
                two: {
                  three: {
                    four: {
                      five: {
                        six: {
                          seven: {
                            height: {
                              foo: __,
                              bar: select('bar'),
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            (_, x) => x.one.two.three.four.five.six.seven.height.bar
          )
          .run()
      ).toEqual(true);
    });
  });

  describe('array', () => {
    it('it should work on 2 levels', () => {
      expect(
        match([{ two: '2', foo: 2, bar: true }])
          .with([{ foo: __, bar: select('bar') }], ({ bar }) => bar)
          .run()
      ).toEqual([true]);
    });

    it('it should work on 3 levels', () => {
      expect(
        match([[{ two: '2', foo: 2, bar: true }]])
          .with([[{ foo: __, bar: select('bar') }]], ({ bar }) => bar)
          .run()
      ).toEqual([[true]]);
    });

    it('it should work on 4 levels', () => {
      expect(
        match([[[{ two: '2', foo: 2, bar: true }]]])
          .with([[[{ foo: __, bar: select('bar') }]]], ({ bar }) => bar)
          .run()
      ).toEqual([[[true]]]);
    });

    it('it should work on 5 levels', () => {
      expect(
        match([[[[{ two: '2', foo: 2, bar: true }]]]])
          .with([[[[{ foo: __, bar: __ }]]]], ([[[[{ bar }]]]]) => bar)
          .run()
      ).toEqual(true);
    });

    it('it should work on 11 levels', () => {
      expect(
        match([[[[[[[[[[{ two: '2', foo: 2, bar: true }]]]]]]]]]])
          .with(
            [[[[[[[[[[{ foo: __, bar: select('bar') }]]]]]]]]]],
            ({ bar }) => bar
          )
          .run()
      ).toEqual([[[[[[[[[[true]]]]]]]]]]);
    });
  });
});
