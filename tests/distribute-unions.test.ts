import {
  FindUnions,
  Distribute,
  DistributeUnions,
} from '../src/types/DistributeUnions';

import { Equal, Expect, UnionToTuple, ValueOf } from '../src/types/helpers';
import { Option } from './utils';

describe('FindUnions', () => {
  it('should correctly find all unions on an object', () => {
    type cases = [
      Expect<
        Equal<
          FindUnions<{ a: 1 | 2; b: 3 | 4 }>,
          [
            {
              cases:
                | {
                    value: 1;
                    subUnions: [];
                  }
                | {
                    value: 2;
                    subUnions: [];
                  };
              path: ['a'];
            },
            {
              cases:
                | {
                    value: 3;
                    subUnions: [];
                  }
                | {
                    value: 4;
                    subUnions: [];
                  };
              path: ['b'];
            }
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<{ a: 1 | 2; b: 3 | 4; c: 5 | 6 }>,
          [
            {
              cases:
                | {
                    value: 1;
                    subUnions: [];
                  }
                | {
                    value: 2;
                    subUnions: [];
                  };
              path: ['a'];
            },
            {
              cases:
                | {
                    value: 3;
                    subUnions: [];
                  }
                | {
                    value: 4;
                    subUnions: [];
                  };
              path: ['b'];
            },
            {
              cases:
                | {
                    value: 5;
                    subUnions: [];
                  }
                | {
                    value: 6;
                    subUnions: [];
                  };
              path: ['c'];
            }
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<{
            a: 1 | 2;
            b: 3 | 4;
            c: 5 | 6;
            d: { e: 7 | 8; f: 9 | 10 };
          }>,
          [
            {
              cases:
                | {
                    value: 1;
                    subUnions: [];
                  }
                | {
                    value: 2;
                    subUnions: [];
                  };
              path: ['a'];
            },
            {
              cases:
                | {
                    value: 3;
                    subUnions: [];
                  }
                | {
                    value: 4;
                    subUnions: [];
                  };
              path: ['b'];
            },
            {
              cases:
                | {
                    value: 5;
                    subUnions: [];
                  }
                | {
                    value: 6;
                    subUnions: [];
                  };
              path: ['c'];
            },
            {
              cases:
                | {
                    value: 7;
                    subUnions: [];
                  }
                | {
                    value: 8;
                    subUnions: [];
                  };
              path: ['d', 'e'];
            },
            {
              cases:
                | {
                    value: 9;
                    subUnions: [];
                  }
                | {
                    value: 10;
                    subUnions: [];
                  };
              path: ['d', 'f'];
            }
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<{
            a: {
              b: {
                c: {
                  d: { e: 7 | 8; f: 9 | 10 };
                };
              };
            };
          }>,
          [
            {
              cases:
                | {
                    value: 7;
                    subUnions: [];
                  }
                | {
                    value: 8;
                    subUnions: [];
                  };
              path: ['a', 'b', 'c', 'd', 'e'];
            },
            {
              cases:
                | {
                    value: 9;
                    subUnions: [];
                  }
                | {
                    value: 10;
                    subUnions: [];
                  };
              path: ['a', 'b', 'c', 'd', 'f'];
            }
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<{
            a: {
              b: {
                c: {
                  d: { e: 7 | 8; f: 9 | 10 };
                  e: 'not a union';
                };
                g: 2 | 3;
              };
            };
          }>,
          [
            {
              cases:
                | {
                    value: 7;
                    subUnions: [];
                  }
                | {
                    value: 8;
                    subUnions: [];
                  };
              path: ['a', 'b', 'c', 'd', 'e'];
            },
            {
              cases:
                | {
                    value: 9;
                    subUnions: [];
                  }
                | {
                    value: 10;
                    subUnions: [];
                  };
              path: ['a', 'b', 'c', 'd', 'f'];
            },
            {
              cases:
                | {
                    value: 2;
                    subUnions: [];
                  }
                | {
                    value: 3;
                    subUnions: [];
                  };
              path: ['a', 'b', 'g'];
            }
          ]
        >
      >
    ];
  });

  it('should correctly find all unions on a tuple', () => {
    type cases = [
      Expect<
        Equal<
          FindUnions<[1 | 2, 3 | 4]>,
          [
            {
              cases:
                | {
                    value: 1;
                    subUnions: [];
                  }
                | {
                    value: 2;
                    subUnions: [];
                  };
              path: [0];
            },
            {
              cases:
                | {
                    value: 3;
                    subUnions: [];
                  }
                | {
                    value: 4;
                    subUnions: [];
                  };
              path: [1];
            }
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<[1 | 2, 3 | 4, 5 | 6]>,
          [
            {
              cases:
                | {
                    value: 1;
                    subUnions: [];
                  }
                | {
                    value: 2;
                    subUnions: [];
                  };
              path: [0];
            },
            {
              cases:
                | {
                    value: 3;
                    subUnions: [];
                  }
                | {
                    value: 4;
                    subUnions: [];
                  };
              path: [1];
            },
            {
              cases:
                | {
                    value: 5;
                    subUnions: [];
                  }
                | {
                    value: 6;
                    subUnions: [];
                  };
              path: [2];
            }
          ]
        >
      >,
      Expect<
        Equal<
          FindUnions<{ type: 'a'; value: 1 | 2 } | { type: 'b'; value: 4 | 5 }>,
          [
            {
              cases:
                | {
                    value: { type: 'a'; value: 1 | 2 };
                    subUnions: [
                      {
                        cases:
                          | {
                              value: 1;
                              subUnions: [];
                            }
                          | {
                              value: 2;
                              subUnions: [];
                            };
                        path: ['value'];
                      }
                    ];
                  }
                | {
                    value: { type: 'b'; value: 4 | 5 };
                    subUnions: [
                      {
                        cases:
                          | {
                              value: 4;
                              subUnions: [];
                            }
                          | {
                              value: 5;
                              subUnions: [];
                            };
                        path: ['value'];
                      }
                    ];
                  };
              path: [];
            }
          ]
        >
      >
    ];
  });
});

describe('Distribute', () => {
  it('should distribute unions into a list of values with their path', () => {
    type cases = [
      Expect<
        Equal<
          UnionToTuple<
            Distribute<
              [
                {
                  cases:
                    | {
                        value: 1;
                        subUnions: [];
                      }
                    | {
                        value: 2;
                        subUnions: [];
                      };
                  path: [0];
                },
                {
                  cases:
                    | {
                        value: 3;
                        subUnions: [];
                      }
                    | {
                        value: 4;
                        subUnions: [];
                      };
                  path: [1];
                }
              ]
            >
          >,
          [
            [[1, [0]], [3, [1]]],
            [[1, [0]], [4, [1]]],
            [[2, [0]], [3, [1]]],
            [[2, [0]], [4, [1]]]
          ]
        >
      >,
      Expect<
        Equal<
          UnionToTuple<
            Distribute<
              [
                {
                  cases:
                    | {
                        value: 1;
                        subUnions: [];
                      }
                    | {
                        value: 2;
                        subUnions: [];
                      };
                  path: [0];
                },
                {
                  cases:
                    | {
                        value: 3;
                        subUnions: [];
                      }
                    | {
                        value: 4;
                        subUnions: [];
                      };
                  path: [1];
                },
                {
                  cases:
                    | {
                        value: 5;
                        subUnions: [];
                      }
                    | {
                        value: 6;
                        subUnions: [];
                      };
                  path: [2];
                }
              ]
            >
          >,
          [
            [[1, [0]], [3, [1]], [5, [2]]],
            [[1, [0]], [3, [1]], [6, [2]]],
            [[1, [0]], [4, [1]], [5, [2]]],
            [[1, [0]], [4, [1]], [6, [2]]],
            [[2, [0]], [3, [1]], [5, [2]]],
            [[2, [0]], [3, [1]], [6, [2]]],
            [[2, [0]], [4, [1]], [5, [2]]],
            [[2, [0]], [4, [1]], [6, [2]]]
          ]
        >
      >,
      Equal<
        // Nested
        UnionToTuple<
          Distribute<
            [
              {
                cases:
                  | {
                      value: {
                        type: 'a';
                        value: 1 | 2;
                      };
                      subUnions: [
                        {
                          cases:
                            | {
                                value: 1;
                                subUnions: [];
                              }
                            | {
                                value: 2;
                                subUnions: [];
                              };
                          path: ['value'];
                        }
                      ];
                    }
                  | {
                      value: {
                        type: 'b';
                        value: 4 | 5;
                      };
                      subUnions: [
                        {
                          cases:
                            | {
                                value: 4;
                                subUnions: [];
                              }
                            | {
                                value: 5;
                                subUnions: [];
                              };
                          path: ['value'];
                        }
                      ];
                    };
                path: [];
              }
            ]
          >
        >,
        [
          [[{ type: 'a'; value: 1 | 2 }, []], [1, ['value']]],
          [[{ type: 'a'; value: 1 | 2 }, []], [2, ['value']]],
          [[{ type: 'b'; value: 4 | 5 }, []], [4, ['value']]],
          [[{ type: 'b'; value: 4 | 5 }, []], [5, ['value']]]
        ]
      >
    ];
  });
});

describe('DistributeUnions', () => {
  type cases = [
    Expect<
      Equal<
        UnionToTuple<
          DistributeUnions<{ a: 1 | 2; b: '3' | '4'; c: '5' | '6' }>
        >,
        [
          { a: 1; b: '3'; c: '5' },
          { a: 1; b: '3'; c: '6' },
          { a: 1; b: '4'; c: '5' },
          { a: 1; b: '4'; c: '6' },
          { a: 2; b: '3'; c: '5' },
          { a: 2; b: '3'; c: '6' },
          { a: 2; b: '4'; c: '5' },
          { a: 2; b: '4'; c: '6' }
        ]
      >
    >,
    Expect<
      Equal<
        UnionToTuple<
          DistributeUnions<
            | { x: 'a'; value: Option<string> }
            | { x: 'b'; value: Option<number> }
          >
        >,
        [
          { x: 'a'; value: { kind: 'none' } },
          { x: 'a'; value: { kind: 'some'; value: string } },
          { x: 'b'; value: { kind: 'none' } },
          { x: 'b'; value: { kind: 'some'; value: number } }
        ]
      >
    >,
    Expect<
      Equal<
        UnionToTuple<
          DistributeUnions<[1, number] | ['two', string] | [3, boolean]>
        >,
        [[1, number], ['two', string], [3, false], [3, true]]
      >
    >
  ];

  it('should leave unions of literals untouched', () => {
    type cases = [
      Expect<Equal<UnionToTuple<DistributeUnions<'a' | 'b'>>, ['a', 'b']>>,
      Expect<Equal<UnionToTuple<DistributeUnions<1 | 2>>, [1, 2]>>,
      Expect<Equal<UnionToTuple<DistributeUnions<boolean>>, [false, true]>>
    ];
  });

  it('should work on nested tuples', () => {
    type cases = [
      Expect<
        Equal<
          UnionToTuple<
            DistributeUnions<
              | [1, Option<number>]
              | ['two', Option<string>]
              | [3, Option<boolean>]
            >
          >,
          [
            [1, { kind: 'none' }],
            [1, { kind: 'some'; value: number }],
            ['two', { kind: 'none' }],
            ['two', { kind: 'some'; value: string }],
            [3, { kind: 'none' }],
            [3, { kind: 'some'; value: false }],
            [3, { kind: 'some'; value: true }]
          ]
        >
      >
    ];
  });

  it('should work for non unions', () => {
    type cases = [
      Expect<Equal<UnionToTuple<DistributeUnions<{}>>, [{}]>>,
      Expect<Equal<UnionToTuple<DistributeUnions<[]>>, [[]]>>,
      Expect<
        Equal<
          UnionToTuple<DistributeUnions<Map<string, string>>>,
          [Map<string, string>]
        >
      >,
      Expect<Equal<UnionToTuple<DistributeUnions<Set<string>>>, [Set<string>]>>,
      Expect<Equal<UnionToTuple<DistributeUnions<string>>, [string]>>,
      Expect<Equal<UnionToTuple<DistributeUnions<number>>, [number]>>,
      Expect<Equal<UnionToTuple<DistributeUnions<any>>, [any]>>,
      Expect<Equal<UnionToTuple<DistributeUnions<never>>, []>>,
      Expect<Equal<UnionToTuple<DistributeUnions<unknown>>, [unknown]>>
    ];
  });

  it('should work with objects', () => {
    type obj = {
      type: 'type';
      x: undefined;
      q: string;
      union1: 'a' | 'b';
      color: '3';
      union2: '1' | '2';
    };

    type cases = [
      Expect<
        Equal<
          UnionToTuple<DistributeUnions<obj>>,
          [
            {
              type: 'type';
              q: string;
              x: undefined;
              union1: 'a';
              color: '3';
              union2: '1';
            },
            {
              type: 'type';
              q: string;
              x: undefined;
              union1: 'a';
              color: '3';
              union2: '2';
            },
            {
              type: 'type';
              q: string;
              x: undefined;
              union1: 'b';
              color: '3';
              union2: '1';
            },
            {
              type: 'type';
              q: string;
              x: undefined;
              union1: 'b';
              color: '3';
              union2: '2';
            }
          ]
        >
      >
    ];
  });

  it('should work with object optional properties', () => {
    type cases = [
      Expect<
        Equal<
          UnionToTuple<
            DistributeUnions<{
              x: 'a' | 'b';
              y?: string;
            }>
          >,
          [
            { x: 'a'; y: undefined },
            { x: 'a'; y: string },
            { x: 'b'; y: undefined },
            { x: 'b'; y: string }
          ]
        >
      >
    ];
  });

  it('should not distribute unions for lists, set and maps', () => {
    // The reason is that list can be heterogeneous, so
    // matching on a A[] for a in input of (A|B)[] doesn't
    // rule anything out. You can still have a (A|B)[] afterward.
    // The same logic goes for Set and Maps.
    type cases = [
      Expect<
        Equal<UnionToTuple<DistributeUnions<('a' | 'b')[]>>, [('a' | 'b')[]]>
      >,
      Expect<
        Equal<
          UnionToTuple<DistributeUnions<{ type: 'a' | 'b'; x: 'c' | 'd' }[]>>,
          [
            (
              | { type: 'a'; x: 'c' }
              | { type: 'a'; x: 'd' }
              | { type: 'b'; x: 'c' }
              | { type: 'b'; x: 'd' }
            )[]
          ]
        >
      >,
      Expect<
        Equal<UnionToTuple<DistributeUnions<Set<'a' | 'b'>>>, [Set<'a' | 'b'>]>
      >,
      Expect<
        Equal<
          UnionToTuple<DistributeUnions<Map<string, 'a' | 'b'>>>,
          [Map<string, 'a' | 'b'>]
        >
      >,
      Expect<
        Equal<
          UnionToTuple<
            DistributeUnions<
              | {
                  type: 'a';
                  items: { some: string; data: number }[];
                }
              | {
                  type: 'b';
                  items: { other: boolean; data: string }[];
                }
            >
          >,
          [
            {
              type: 'a';
              items: { some: string; data: number }[];
            },
            {
              type: 'b';
              items: { other: boolean; data: string }[];
            }
          ]
        >
      >
    ];
  });
});
