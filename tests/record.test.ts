import { Expect, Equal } from '../src/types/helpers';
import { match, P } from '../src';
import { InvertPatternForExclude } from '../src/types/InvertPattern';

describe('P.record', () => {
  it('should match any object when called with P.unknown', () => {
    const input = { a: 1, b: 2 };

    const result = match(input)
      .with(P.record(P.unknown), () => 'matched object')
      .otherwise(() => 'no match');

    expect(result).toEqual('matched object');
  });

  it('should match empty objects', () => {
    const input = {};

    const result = match(input)
      .with(P.record(P.string, P.number), () => 'matched')
      .otherwise(() => 'no match');

    expect(result).toEqual('matched');
  });

  it('should match Record<string, number> patterns', () => {
    const userScores = {
      alice: 100,
      bob: 85,
      charlie: 92,
    };

    const result = match<Record<string, number>>(userScores)
      .with(P.record(P.string, P.number), (scores) => {
        return 'all string keys with number values';
      })
      .otherwise(() => 'no match');

    expect(result).toEqual('all string keys with number values');
  });

  it('should not match objects with incorrect key types', () => {
    const mixedKeys: Record<string | number, string> = {
      alice: 'developer',
      [Symbol.for('answer')]: 'answer',
    };

    const result = match(mixedKeys)
      .with(P.record(P.string, P.string), () => 'string keys only')
      .with(P.record(P.union(P.string, P.symbol), P.string), () => 'mixed keys')
      .otherwise(() => 'no match');

    expect(result).toEqual('mixed keys');
  });

  it('should not match objects with incorrect value types', () => {
    const mixedValues = {
      a: 'string',
      b: 42,
      c: true,
    };

    const result = match(mixedValues)
      .with(P.record(P.string, P.string), () => 'string values only')
      .with(
        P.record(P.string, P.union(P.string, P.number, P.boolean)),
        () => 'mixed values'
      )
      .otherwise(() => 'no match');

    expect(result).toEqual('mixed values');
  });

  it('should work with complex value patterns', () => {
    const userProfiles: unknown = {
      alice: { name: 'Alice', age: 25, active: true },
      bob: { name: 'Bob', age: 30, active: false },
    };

    const result = match(userProfiles)
      .with(
        P.record(P.string, {
          name: P.string,
          age: P.number,
          active: P.boolean,
        }),
        (profiles) => {
          type t = Expect<
            Equal<
              typeof profiles,
              Record<string, { name: string; age: number; active: boolean }>
            >
          >;
          return 'user profiles';
        }
      )
      .otherwise(() => 'no match');

    expect(result).toEqual('user profiles');
  });

  it('should support basic selection patterns', () => {
    const data = {
      user1: { name: 'Alice' },
      user2: { name: 'Bob' },
    };

    const result = match<Record<string, { name: string }>>(data)
      .with(P.record(P.string, { name: P.string }), (records) => {
        type t = Expect<
          Equal<typeof records, Record<string, { name: string }>>
        >;
        return 'matched user records';
      })
      .otherwise(() => 'no match');

    expect(result).toEqual('matched user records');
  });

  it('should not match null', () => {
    const result = match(null)
      .with(P.record(P.string, P.number), () => 'matched')
      .otherwise(() => 'no match');

    expect(result).toEqual('no match');
  });

  it('should not match arrays', () => {
    const result = match(['a', 'b'])
      .with(P.record(P.string, P.string), () => 'matched')
      .otherwise(() => 'no match');

    expect(result).toEqual('no match');
  });

  it('should not match primitives', () => {
    const result = match('string')
      .with(P.record(P.string, P.string), () => 'matched')
      .otherwise(() => 'no match');

    expect(result).toEqual('no match');
  });

  it('should not match objects with incorrect value types', () => {
    const result = match({ a: 1, b: 2 })
      .with(P.record(P.union(1, 2), P.number), () => 'matched')
      .otherwise(() => 'no match');

    expect(result).toEqual('no match');

    const result2 = match({ a: 1, b: 2 })
      .with(P.record(P.number, P.number), () => 'matched')
      .otherwise(() => 'no match');

    expect(result2).toEqual('no match');
  });

  it('should work with P.record().optional()', () => {
    type Data = {
      records?: Record<string, number>;
    };

    const data1: Data = { records: { a: 1, b: 2 } };
    const data2: Data = {};

    const matchResult = (input: Data) =>
      match(input)
        .with({ records: P.record(P.string, P.number).optional() }, (x) => {
          type t = Expect<Equal<typeof x, Data>>;
          return 'has records';
        })
        .otherwise(() => 'no records');

    expect(matchResult(data1)).toEqual('has records');
    expect(matchResult(data2)).toEqual('has records');
  });

  it('should work with numeric keys', () => {
    const numericRecord: Record<number, string> = {
      1: 'one',
      2: 'two',
      3: 'three',
    };

    const result = match(numericRecord)
      .with(P.record(P.number, P.string), (value) => {
        type t = Expect<Equal<typeof value, Record<number, string>>>;
        return 'numeric keys';
      })
      .otherwise(() => 'no match');

    expect(result).toEqual('numeric keys');
  });

  it('should throw error when given only one argument', () => {
    expect(() => {
      // Create a matcher that expects key and value but only gets key
      const result = match({ a: 1 }).with(P.record(P.unknown), (value) => {
        type t = Expect<Equal<typeof value, { readonly a: 1 }>>;
        return 'matched';
      });
      return result;
    }).toBeDefined(); // Just check this doesn't crash the compilation
  });

  it('should work with chaining methods', () => {
    type OptionalRecord = {
      data?: Record<string, number>;
    };

    const input1: OptionalRecord = { data: { a: 1, b: 2 } };
    const input2: OptionalRecord = {};

    const matchResult = (input: OptionalRecord) =>
      match(input)
        .with(
          { data: P.record(P.string, P.union(1, 2)).optional() },
          (value) => {
            type t = Expect<
              Equal<typeof value, { data?: Record<string, 1 | 2> }>
            >;
            return 'has data';
          }
        )
        .otherwise(() => 'no data');

    expect(matchResult(input1)).toEqual('has data');
    expect(matchResult(input2)).toEqual('has data');
  });

  it('should handle complex nested patterns', () => {
    const nestedData: unknown = {
      users: {
        alice: { profile: { name: 'Alice', age: 25 }, active: true },
        bob: { profile: { name: 'Bob', age: 30 }, active: false },
      },
    };

    const result = match(nestedData)
      .with(
        {
          users: P.record(P.string, {
            profile: { name: P.string, age: P.number },
            active: P.boolean,
          }),
        },
        (value) => {
          type t = Expect<
            Equal<
              typeof value,
              {
                users: Record<
                  string,
                  { profile: { name: string; age: number }; active: boolean }
                >;
              }
            >
          >;
          return 'complex nested match';
        }
      )
      .otherwise(() => 'no match');

    expect(result).toEqual('complex nested match');
  });

  it('should support symbol keys', () => {
    const f = (input: unknown) =>
      match(input)
        .with(P.record(P.symbol, P.number), (value) => {
          type t = Expect<Equal<typeof value, Record<symbol, number>>>;
          return 'matched';
        })
        .otherwise(() => 'no match');

    expect(f({ a: 1, b: 2 })).toEqual('no match');
    expect(f({ [Symbol('a')]: 1, [Symbol('b')]: 2 })).toEqual('matched');
  });

  describe('numeric keys', () => {
    it('should match numeric keys', () => {
      const input: unknown = { 1: 'one', 2: 'two', 3: 'three' };
      const result = match(input)
        .with(P.record(P.number, P.string), (value) => {
          type t = Expect<Equal<typeof value, Record<number, string>>>;
          return 'matched';
        })
        .otherwise(() => 'no match');
      expect(result).toEqual('matched');
    });

    it('should match with number literals', () => {
      const input: unknown = { 1: 'one' };
      const result = match(input)
        .with(P.record(1, P.string), (value) => {
          type t = Expect<Equal<typeof value, Record<1, string>>>;
          return 'matched';
        })
        .otherwise(() => 'no match');
      expect(result).toEqual('matched');
    });

    it('should match with unions of number literals', () => {
      const input: unknown = { 1: 'one', 2: 'two' };
      const result = match(input)
        .with(P.record(P.union(1, 2), P.string), (value) => {
          type t = Expect<Equal<typeof value, Record<1 | 2, string>>>;
          return 'matched';
        })
        .otherwise(() => 'no match');
      expect(result).toEqual('matched');
    });

    it('P.string should also match numeric keys', () => {
      const input: unknown = { 1: 'one', 2: 'two' };
      const result = match(input)
        .with(P.record(P.string, P.string), (value) => {
          type t = Expect<Equal<typeof value, Record<string, string>>>;
          return 'matched';
        })
        .otherwise(() => 'no match');
      expect(result).toEqual('matched');
    });
  });

  describe('select', () => {
    it('should select all keys as an array when select is used in the key position', () => {
      const input: unknown = { a: 1, b: 2 };
      const result = match(input)
        .with(P.record(P.string.select(), P.number), (value) => {
          type t = Expect<Equal<typeof value, string[]>>;
          return value;
        })
        .otherwise(() => 'no match');

      expect(result).toEqual(['a', 'b']);
    });

    it('should select all values as an array when select is used in the value position', () => {
      const input: unknown = { a: 1, b: 2 };
      const result = match(input)
        .with(P.record(P.string, P.number.select()), (value) => {
          type t = Expect<Equal<typeof value, number[]>>;
          return value;
        })
        .otherwise(() => 'no match');

      expect(result).toEqual([1, 2]);
    });

    it('should select arrays when select() is nested inside the record value pattern', () => {
      const input: unknown = {
        a: { name: { first: 'John', last: 'Doe' } },
        b: { name: { first: 'Jane', last: 'Doe' } },
      };
      const result = match(input)
        .with(
          P.record(P.string, { name: { first: P.string.select() } }),
          (value) => {
            type t = Expect<Equal<typeof value, string[]>>;
            return value;
          }
        )
        .otherwise(() => 'no match');

      expect(result).toEqual(['John', 'Jane']);
    });
  });

  describe('type inference', () => {
    it("shouldn't accept key patterns that aren't PropertyKey", () => {
      const input: unknown = { a: 1, b: 2 };
      const result = match(input)
        // @ts-expect-error 👇 error should be here
        .with(P.record({}, P.number), (value) => {})
        // FIXME: P.array(), etc are accepted, but shouldn't.
        .with(P.record(P.array(), P.number), (value) => {})
        .otherwise(() => 'no match');

      expect(result).toEqual('no match');
    });

    it('should infer the correct type', () => {
      const input: unknown = { a: 1, b: 2 };

      match(input)
        .with(P.record(P.string, P.union(1, 2)), (value) => {
          type t = Expect<Equal<typeof value, Record<string, 1 | 2>>>;
          return 'matched';
        })
        // or pattern
        .with(P.record(P.string, P.union(1, 2)).or(123), (value) => {
          type t = Expect<Equal<typeof value, Record<string, 1 | 2> | 123>>;
          return 'matched';
        })
        // and pattern
        .with(P.record(P.string, P.union(1, 2)).and({ a: 1 }), (value) => {
          type t = Expect<
            Equal<typeof value, Record<string, 1 | 2> & { a: 1 }>
          >;
          return 'matched';
        })
        // key pattern
        .with(P.record(P.number, P.number), (value) => {
          type t = Expect<Equal<typeof value, Record<number, number>>>;
          return 'matched';
        })
        .with(P.record(P.union(1, 2, 3), P.number), (value) => {
          type t = Expect<Equal<typeof value, Record<1 | 2 | 3, number>>>;
          return 'matched';
        })
        // select a key
        .with(P.record(P.number.select(), P.number), (value) => {
          type t = Expect<Equal<typeof value, number[]>>;
          return 'matched';
        })
        // select a value
        .with(P.record(P.number, P.number.select()), (value) => {
          type t = Expect<Equal<typeof value, number[]>>;
          return 'matched';
        })
        // nested records
        .with(P.record(P.number, P.record(P.string, P.number)), (value) => {
          type t = Expect<
            Equal<typeof value, Record<number, Record<string, number>>>
          >;
          return 'matched';
        })
        // nested records with select
        .with(
          P.record(P.number, P.record(P.string, P.number.select())),
          (value) => {
            type t = Expect<Equal<typeof value, number[][]>>;
            return 'matched';
          }
        )
        // optional modifier
        .with(P.record(P.number, P.number).optional(), (value) => {
          type t = Expect<
            Equal<typeof value, Record<number, number> | undefined>
          >;
          return 'matched';
        })
        // arrays of records
        .with(P.array(P.record(P.string, P.number)), (value) => {
          type t = Expect<Equal<typeof value, Record<string, number>[]>>;
          return 'matched';
        })
        // records of arrays
        .with(P.record(P.string, P.array(P.number)), (value) => {
          type t = Expect<Equal<typeof value, Record<string, number[]>>>;
          return 'matched';
        })
        // tuple containing records
        .with([P.record(P.string, P.number), P.number], (value) => {
          type t = Expect<
            Equal<typeof value, [Record<string, number>, number]>
          >;
          return 'matched';
        })
        .otherwise(() => 'no match');
    });

    it("shouldn't allow incorrect value types", () => {
      const input: Record<string, { name: string; age?: number }> = {
        a: { name: 'John' },
        b: { name: 'Jane' },
      };
      const result = match(input)
        // if the pattern is correct, it should accept it
        .with(
          P.record(P.string, {
            age: P.number,
          }),
          (value) => {
            return 'matched';
          }
        )
        .with(
          P.record(P.string, {
            // @ts-expect-error
            firstName: P.string,
          }),
          (value) => {
            return 'matched';
          }
        )

        .otherwise(() => 'no match');

      expect(result).toEqual('no match');
    });

    // it("shouldn't allow incorrect key types", () => {
    //   const input: Record<`key_${number}`, number> = {
    //     [`key_1`]: 1,
    //     [`key_2`]: 2,
    //   };

    //   const result = match(input)
    //     .with(P.record('key_1', P.number), (value) => {
    //       return 'matched';
    //     })
    //     .with(
    //       P.record(
    //         'hello',
    //         P.number
    //       ),
    //       (value) => {
    //         return 'matched';
    //       }
    //     )
    //     .otherwise(() => 'no match');
    // });

    it('should exclude the correct types for exhaustive checking', () => {
      const input: Record<`key_${number}`, number> = {
        [`key_1`]: 1,
        [`key_2`]: 2,
      };
      const pat = P.record('key_1', P.number);
      type pat = typeof pat;
      type inv = InvertPatternForExclude<pat, typeof input>;
      type test = Exclude<typeof input, inv>;
    });
  });
});
