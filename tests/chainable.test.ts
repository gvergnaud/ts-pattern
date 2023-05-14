import { P, match } from '../src';
import { Equal, Expect } from '../src/types/helpers';

describe('chainable methods', () => {
  describe('string', () => {
    it(`P.string.includes('str')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.includes('!!'), (value) => {
            type t = Expect<Equal<typeof value, string>>;
            return 'includes !!';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello!!')).toBe('includes !!');
      expect(f('nope')).toBe('something else');
    });

    it(`P.string.startsWith('str')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.startsWith('hello '), (value) => {
            type t = Expect<Equal<typeof value, `hello ${string}`>>;
            return 'starts with hello';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello gabriel')).toBe('starts with hello');
      expect(f('gabriel')).toBe('something else');
    });

    it(`P.string.endsWith('str')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.endsWith('!!'), (value) => {
            type t = Expect<Equal<typeof value, `${string}!!`>>;
            return 'ends with !!';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello!!')).toBe('ends with !!');
      expect(f('nope')).toBe('something else');
    });
    it(`P.string.regex('^[a-z]+$')`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.regex('^[a-z]+$'), (value) => {
            type t = Expect<Equal<typeof value, string>>;
            return 'single word';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('hello')).toBe('single word');
      expect(f('a b c')).toBe('something else');
    });

    it(`P.string.regex(/[a-z]+/)`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.string.regex(/^https?:\/\//), (value) => {
            type t = Expect<Equal<typeof value, string>>;
            return 'url';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f('https://type-level-typescript.com')).toBe('url');
      expect(f('a b c')).toBe('something else');
    });

    describe('compositions', () => {
      it(`P.string.optional()`, () => {
        const f = (input?: string | number) =>
          match(input)
            .with(P.string.optional(), (value) => {
              type t = Expect<Equal<typeof value, string | undefined>>;
              return `yes ${value}`;
            })
            .otherwise((value) => {
              type t = Expect<Equal<typeof value, number>>;
              return 'no';
            });

        expect(f(102)).toBe('no');
        expect(f()).toBe('yes undefined');
        expect(f('gabriel')).toBe('yes gabriel');
      });

      it(`P.string.select()`, () => {
        const f = (input?: string | number) =>
          match({ input })
            .with({ input: P.string.select() }, (value) => {
              type t = Expect<Equal<typeof value, string>>;
              return `yes ${value}`;
            })
            .otherwise(() => 'no');

        expect(f(102)).toBe('no');
        expect(f()).toBe('no');
        expect(f('gabriel')).toBe('yes gabriel');
      });
      it(`P.number.optional.select()`, () => {
        const f = (input?: string | number) =>
          match({ input })
            .with({ input: P.number.optional().select() }, (value) => {
              type t = Expect<Equal<typeof value, number | undefined>>;
              return `yes ${value}`;
            })
            .otherwise(() => 'no');

        expect(f(102)).toBe('yes 102');
        expect(f()).toBe('yes undefined');
        expect(f('gabriel')).toBe('no');
      });
      it(`P.string.optional.select()`, () => {
        const f = (input?: string | number) =>
          match({ input })
            .with({ input: P.string.optional().select() }, (value) => {
              type t = Expect<Equal<typeof value, string | undefined>>;
              return `yes ${value}`;
            })
            .otherwise(() => 'no');

        expect(f(102)).toBe('no');
        expect(f()).toBe('yes undefined');
        expect(f('gabriel')).toBe('yes gabriel');
      });
      it(`P.string.startsWith(..).optional().select()`, () => {
        const f = (input?: string | number) =>
          match({ input })
            .with(
              {
                input: P.string.startsWith('hello ').optional().select(),
              },
              (value) => {
                type t = Expect<
                  Equal<typeof value, `hello ${string}` | undefined>
                >;
                return `starts with hello: ${value}`;
              }
            )
            .otherwise(() => 'no');

        expect(f('hello gabriel')).toBe('starts with hello: hello gabriel');
        expect(f('gabriel')).toBe('no');
      });

      it('P.string.startsWith(..).endsWith(..)', () => {
        const f = (input?: string | number) =>
          match(input)
            .with(P.string.startsWith('hello ').endsWith('!'), (value) => {
              type t = Expect<
                Equal<typeof value, `hello ${string}` & `${string}!`>
              >;
              return `yes: ${value}`;
            })
            .otherwise(() => 'no');

        expect(f('hello gabriel!')).toBe('yes: hello gabriel!');
        expect(f('hello gabriel')).toBe('no');
        expect(f('gabriel!')).toBe('no');
        expect(f('gabriel')).toBe('no');
      });
    });
  });

  describe('number', () => {
    it(`P.number.between(1, 10)`, () => {
      const f = (input: string | number) =>
        match(input)
          .with(P.number.between(0, 10), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'between 0 and 10';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number>>;
            return 'something else';
          });

      expect(f(5)).toBe('between 0 and 10');
      expect(f(0)).toBe('between 0 and 10');
      expect(f(10)).toBe('between 0 and 10');
      expect(f('gabriel')).toBe('something else');
    });

    it(`P.number.lt(..)`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.lt(10), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('yes');
      expect(f(12)).toBe('no');
      expect(f(10n)).toBe('no');
    });
    it(`P.number.gt(..)`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.gt(10), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('no');
      expect(f(10)).toBe('no');
      expect(f(12)).toBe('yes');
    });
    it(`P.number.gte(..)`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.gte(10), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('no');
      expect(f(10)).toBe('yes');
      expect(f(12)).toBe('yes');
    });
    it(`P.number.lte(..)`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.lte(10), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('yes');
      expect(f(10)).toBe('yes');
      expect(f(12)).toBe('no');
    });
    it(`P.number.int(..)`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.int(), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('yes');
      expect(f(10.123)).toBe('no');
      expect(f(-Infinity)).toBe('no');
    });
    it(`P.number.finite()`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.finite(), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('yes');
      expect(f(10.123)).toBe('yes');
      expect(f(-Infinity)).toBe('no');
    });
    it(`P.number.positive()`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.positive(), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('yes');
      expect(f(10.123)).toBe('yes');
      expect(f(-10.123)).toBe('no');
      expect(f(-Infinity)).toBe('no');
    });
    it(`P.number.negative()`, () => {
      const f = (input: string | number | bigint) =>
        match(input)
          .with(P.number.negative(), (value) => {
            type t = Expect<Equal<typeof value, number>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | number | bigint>>;
            return 'no';
          });

      expect(f(5)).toBe('no');
      expect(f(10.123)).toBe('no');
      expect(f(-10.123)).toBe('yes');
      expect(f(-Infinity)).toBe('yes');
    });

    describe('compositions', () => {
      it(`P.number.optional()`, () => {
        const f = (input?: string | number) =>
          match(input)
            .with(P.number.optional(), (value) => {
              type t = Expect<Equal<typeof value, number | undefined>>;
              return `yes ${value}`;
            })
            .otherwise((value) => {
              type t = Expect<Equal<typeof value, string>>;
              return 'no';
            });

        expect(f(102)).toBe('yes 102');
        expect(f()).toBe('yes undefined');
        expect(f('gabriel')).toBe('no');
      });

      it(`P.number.select()`, () => {
        const f = (input?: string | number) =>
          match({ input })
            .with({ input: P.number.select() }, (value) => {
              type t = Expect<Equal<typeof value, number>>;
              return `yes ${value}`;
            })
            .otherwise(() => 'no');

        expect(f(102)).toBe('yes 102');
        expect(f()).toBe('no');
        expect(f('gabriel')).toBe('no');
      });

      it(`P.number.int().positive().finite().between(..).optional().select(),`, () => {
        const f = (input?: string | number) =>
          match({ input })
            .with(
              {
                input: P.number
                  .int()
                  .positive()
                  .finite()
                  .between(3, 7)
                  .optional()
                  .select(),
              },
              (value) => {
                type t = Expect<Equal<typeof value, number | undefined>>;
                return `yes ${value}`;
              }
            )
            .otherwise(() => 'no');

        expect(f(5)).toBe('yes 5');
        expect(f()).toBe('yes undefined');
        expect(f(1)).toBe('no');
        expect(f(8)).toBe('no');
        expect(f(-2)).toBe('no');
        expect(f(4.123)).toBe('no');
        expect(f(Infinity)).toBe('no');
      });
    });
  });

  describe('bigint', () => {
    it(`P.bigint.between(1, 10)`, () => {
      const f = (input: string | bigint) =>
        match(input)
          .with(P.bigint.between(0n, 10n), (value) => {
            type t = Expect<Equal<typeof value, bigint>>;
            return 'between 0 and 10';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | bigint>>;
            return 'something else';
          });

      expect(f(5n)).toBe('between 0 and 10');
      expect(f(0n)).toBe('between 0 and 10');
      expect(f(10n)).toBe('between 0 and 10');
      expect(f('gabriel')).toBe('something else');
    });

    it(`P.bigint.lt(..)`, () => {
      const f = (input: string | bigint) =>
        match(input)
          .with(P.bigint.lt(10n), (value) => {
            type t = Expect<Equal<typeof value, bigint>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | bigint>>;
            return 'no';
          });

      expect(f(5n)).toBe('yes');
      expect(f(12n)).toBe('no');
      expect(f(10n)).toBe('no');
    });
    it(`P.bigint.gt(..)`, () => {
      const f = (input: string | bigint) =>
        match(input)
          .with(P.bigint.gt(10n), (value) => {
            type t = Expect<Equal<typeof value, bigint>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | bigint>>;
            return 'no';
          });

      expect(f(5n)).toBe('no');
      expect(f(10n)).toBe('no');
      expect(f(12n)).toBe('yes');
    });
    it(`P.bigint.gte(..)`, () => {
      const f = (input: string | bigint) =>
        match(input)
          .with(P.bigint.gte(10n), (value) => {
            type t = Expect<Equal<typeof value, bigint>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | bigint>>;
            return 'no';
          });

      expect(f(5n)).toBe('no');
      expect(f(10n)).toBe('yes');
      expect(f(12n)).toBe('yes');
    });
    it(`P.bigint.lte(..)`, () => {
      const f = (input: string | bigint) =>
        match(input)
          .with(P.bigint.lte(10n), (value) => {
            type t = Expect<Equal<typeof value, bigint>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | bigint>>;
            return 'no';
          });

      expect(f(5n)).toBe('yes');
      expect(f(10n)).toBe('yes');
      expect(f(12n)).toBe('no');
    });
    it(`P.bigint.positive()`, () => {
      const f = (input: string | bigint) =>
        match(input)
          .with(P.bigint.positive(), (value) => {
            type t = Expect<Equal<typeof value, bigint>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | bigint>>;
            return 'no';
          });

      expect(f(5n)).toBe('yes');
      expect(f(10123n)).toBe('yes');
      expect(f(-10123n)).toBe('no');
    });
    it(`P.bigint.negative()`, () => {
      const f = (input: string | bigint) =>
        match(input)
          .with(P.bigint.negative(), (value) => {
            type t = Expect<Equal<typeof value, bigint>>;
            return 'yes';
          })
          .otherwise((value) => {
            type t = Expect<Equal<typeof value, string | bigint>>;
            return 'no';
          });

      expect(f(5n)).toBe('no');
      expect(f(10123n)).toBe('no');
      expect(f(-10123n)).toBe('yes');
    });

    describe('compositions', () => {
      it(`P.bigint.optional()`, () => {
        const f = (input?: string | bigint) =>
          match(input)
            .with(P.bigint.optional(), (value) => {
              type t = Expect<Equal<typeof value, bigint | undefined>>;
              return `yes ${value}`;
            })
            .otherwise((value) => {
              type t = Expect<Equal<typeof value, string>>;
              return 'no';
            });

        expect(f(102n)).toBe('yes 102');
        expect(f()).toBe('yes undefined');
        expect(f('gabriel')).toBe('no');
      });

      it(`P.bigint.select()`, () => {
        const f = (input?: string | bigint) =>
          match({ input })
            .with({ input: P.bigint.select() }, (value) => {
              type t = Expect<Equal<typeof value, bigint>>;
              return `yes ${value}`;
            })
            .otherwise(() => 'no');

        expect(f(102n)).toBe('yes 102');
        expect(f()).toBe('no');
        expect(f('gabriel')).toBe('no');
      });

      it(`P.bigint.positive().between(..).optional().select(),`, () => {
        const f = (input?: string | bigint) =>
          match({ input })
            .with(
              {
                input: P.bigint.positive().between(3n, 7n).optional().select(),
              },
              (value) => {
                type t = Expect<Equal<typeof value, bigint | undefined>>;
                return `yes ${value}`;
              }
            )
            .otherwise(() => 'no');

        expect(f(5n)).toBe('yes 5');
        expect(f()).toBe('yes undefined');
        expect(f(1n)).toBe('no');
        expect(f(8n)).toBe('no');
        expect(f(-2n)).toBe('no');
      });
    });
  });

  describe('and', () => {
    it('should infer the intersection of narrowed patterns', () => {
      const f = (input?: string | number) =>
        match(input)
          .with(
            P.string.startsWith('hello ').and(P.string.endsWith('!')),
            (value) => {
              type t = Expect<
                Equal<typeof value, `hello ${string}` & `${string}!`>
              >;
              return `yes: ${value}`;
            }
          )
          .otherwise(() => 'no');

      expect(f('hello gabriel!')).toBe('yes: hello gabriel!');
      expect(f('hello gabriel')).toBe('no');
      expect(f('gabriel!')).toBe('no');
      expect(f('gabriel')).toBe('no');
    });
  });
});
