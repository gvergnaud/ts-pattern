import * as symbols from '../src/internals/symbols';
import {
  FindSelected,
  MixedNamedAndAnonymousSelectError,
  SeveralAnonymousSelectError,
} from '../src/types/FindSelected';
import { Equal, Expect } from '../src/types/helpers';
import {
  Matcher,
  SelectP,
  NotP,
  OptionalP,
  ArrayP,
} from '../src/types/Pattern';
import { Event, State } from './types-catalog/utils';

type AnonymousSelectP = SelectP<symbols.anonymousSelectKey>;

describe('FindSelected', () => {
  describe('should correctly return kwargs', () => {
    it('Tuples', () => {
      type res1 = FindSelected<
        { a: { b: { c: [3] } } },
        {
          a: {
            b: {
              c: [SelectP<'c'>];
            };
          };
        }
      >;
      type test1 = Expect<Equal<res1, { c: 3 }>>;

      type cases = [
        Expect<
          Equal<
            FindSelected<[State, Event], [SelectP<'state'>, SelectP<'event'>]>,
            { state: State; event: Event }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [1, 2, 3],
              [SelectP<'first'>, SelectP<'second'>, SelectP<'third'>]
            >,
            { first: 1; second: 2; third: 3 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [1, 2, 3, 4],
              [SelectP<'1'>, SelectP<'2'>, SelectP<'3'>, SelectP<'4'>]
            >,
            { '1': 1; '2': 2; '3': 3; '4': 4 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [1, 2, 3, 4, 5],
              [
                SelectP<'1'>,
                SelectP<'2'>,
                SelectP<'3'>,
                SelectP<'4'>,
                SelectP<'5'>
              ]
            >,
            { '1': 1; '2': 2; '3': 3; '4': 4; '5': 5 }
          >
        >
      ];
    });

    describe('variadic tuples', () => {
      it('[a, ...b[]]', () => {
        type res1 = FindSelected<
          [State, ...Event[]],
          [SelectP<'state'>, ...ArrayP<unknown, SelectP<'event'>>[]]
        >;
        type test1 = Expect<Equal<res1, { state: State; event: Event[] }>>;

        type res2 = FindSelected<
          [1, ...number[]],
          [AnonymousSelectP, ...ArrayP<unknown, unknown>[]]
        >;
        type test2 = Expect<Equal<res2, 1>>;

        type res3 = FindSelected<
          [1, ...number[]],
          [unknown, ...ArrayP<unknown, AnonymousSelectP>[]]
        >;
        type test3 = Expect<Equal<res3, number[]>>;
      });

      it('[a, b, ...c[]]', () => {
        type res1 = FindSelected<
          [State, State, ...Event[]],
          [
            SelectP<'state'>,
            SelectP<'state2'>,
            ...ArrayP<unknown, SelectP<'event'>>[]
          ]
        >;
        type test1 = Expect<
          Equal<res1, { state: State; state2: State; event: Event[] }>
        >;

        type res2 = FindSelected<
          [1, 2, ...number[]],
          [AnonymousSelectP, unknown, ...ArrayP<unknown, unknown>[]]
        >;
        type test2 = Expect<Equal<res2, 1>>;

        type res3 = FindSelected<
          [1, 2, ...number[]],
          [unknown, AnonymousSelectP, ...ArrayP<unknown, unknown>[]]
        >;
        type test3 = Expect<Equal<res3, 2>>;

        type res4 = FindSelected<
          [1, 2, ...number[]],
          [unknown, unknown, ...ArrayP<unknown, AnonymousSelectP>[]]
        >;
        type test4 = Expect<Equal<res4, number[]>>;
      });
      it('[...a[], b]', () => {
        type res1 = FindSelected<
          [...Event[], State],
          [...ArrayP<unknown, SelectP<'event'>>[], SelectP<'state'>]
        >;
        type test1 = Expect<Equal<res1, { state: State; event: Event[] }>>;

        type res2 = FindSelected<
          [...number[], 1],
          [...ArrayP<unknown, unknown>[], AnonymousSelectP]
        >;
        type test2 = Expect<Equal<res2, 1>>;

        type res3 = FindSelected<
          [...number[], 1],
          [...ArrayP<unknown, AnonymousSelectP>[], unknown]
        >;
        type test3 = Expect<Equal<res3, number[]>>;
      });
      it('[...a[], b, c]', () => {
        type res1 = FindSelected<
          [...Event[], State, State],
          [
            ...ArrayP<unknown, SelectP<'event'>>[],
            SelectP<'state'>,
            SelectP<'state2'>
          ]
        >;
        type test1 = Expect<
          Equal<res1, { state: State; state2: State; event: Event[] }>
        >;

        type res2 = FindSelected<
          [...number[], 1, 2],
          [...ArrayP<unknown, unknown>[], AnonymousSelectP, unknown]
        >;
        type test2 = Expect<Equal<res2, 1>>;

        type res3 = FindSelected<
          [...number[], 1, 2],
          [...ArrayP<unknown, unknown>[], unknown, AnonymousSelectP]
        >;
        type test3 = Expect<Equal<res3, 2>>;

        type res4 = FindSelected<
          [...number[], 1, 2],
          [...ArrayP<unknown, AnonymousSelectP>[], unknown, unknown]
        >;
        type test4 = Expect<Equal<res4, number[]>>;
      });

      it('[a, ...b[], c]', () => {
        type res1 = FindSelected<
          [State, ...Event[], State],
          [
            SelectP<'state'>,
            ...ArrayP<unknown, SelectP<'event'>>[],
            SelectP<'state2'>
          ]
        >;
        type test1 = Expect<
          Equal<res1, { state: State; state2: State; event: Event[] }>
        >;

        type res2 = FindSelected<
          [1, ...number[], 2],
          [AnonymousSelectP, ...ArrayP<unknown, unknown>[], unknown]
        >;
        type test2 = Expect<Equal<res2, 1>>;

        type res3 = FindSelected<
          [1, ...number[], 2],
          [unknown, ...ArrayP<unknown, unknown>[], AnonymousSelectP]
        >;
        type test3 = Expect<Equal<res3, 2>>;

        type res4 = FindSelected<
          [1, ...number[], 2],
          [unknown, ...ArrayP<unknown, AnonymousSelectP>[], unknown]
        >;
        type test4 = Expect<Equal<res4, number[]>>;
      });

      it('[a, b, select(c), ...d[], e]', () => {
        type res1 = FindSelected<
          [State, State, number, ...Event[], 1],
          [1, 2, AnonymousSelectP, ...ArrayP<unknown, 3>[], 4]
        >;
        type test1 = Expect<Equal<res1, number>>;

        type res2 = FindSelected<
          [State, State, Event, ...State[], 1],
          [1, 2, AnonymousSelectP, ...ArrayP<unknown, 3>[], 4]
        >;
        type test2 = Expect<Equal<res2, Event>>;
      });

      it('[a, ...b[], select(c), d, e]', () => {
        type res1 = FindSelected<
          [State, State, State, number, State, State],
          [1, ...ArrayP<unknown, 3>[], AnonymousSelectP, 4, 2]
        >;
        type test1 = Expect<Equal<res1, number>>;

        type res2 = FindSelected<
          [State, State, State, State, number, State],
          [1, ...ArrayP<unknown, 3>[], AnonymousSelectP, 4, 2]
        >;
        type test2 = Expect<Equal<res2, State>>;
      });
    });

    it('list selections should be wrapped in arrays', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<State[], ArrayP<unknown, SelectP<'state'>>>,
            { state: State[] }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              State[][],
              ArrayP<unknown, ArrayP<unknown, SelectP<'state'>>>
            >,
            { state: State[][] }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              State[][][],
              ArrayP<
                unknown,
                ArrayP<unknown, ArrayP<unknown, SelectP<'state'>>>
              >
            >,
            { state: State[][][] }
          >
        >
      ];
    });

    it('Objects', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<
              { a: { b: { c: 3 } } },
              { a: { b: { c: SelectP<'c'> } } }
            >,
            { c: 3 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              { a: { b: { c: 3 }; d: { e: 7 } } },
              {
                a: {
                  b: { c: SelectP<'c'> };
                  d: { e: SelectP<'e'> };
                };
              }
            >,
            { c: 3; e: 7 }
          >
        >
      ];
    });

    it('Mixed', () => {
      type res1 = FindSelected<
        { a: { b: { c: [3, 4] } } },
        { a: { b: { c: [SelectP<'c'>, unknown] } } }
      >;

      type res12 = FindSelected<
        [{ c: 3 }, { e: 7 }],
        [{ c: SelectP<'c'> }, { e: 7 }]
      >;

      type x = Extract<[1, 2], readonly any[]>;
      type test1 = Expect<Equal<res1, { c: 3 }>>;
      type res2 = FindSelected<
        { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
        {
          a: [{ c: SelectP<'c'> }, { e: 7 }];
          b: Matcher<unknown, { d: SelectP<'d'> }, 'array'>;
        }
      >;
      type test2 = Expect<Equal<res2, { c: 3; d: string[] }>>;
    });
  });

  describe('Anonymous selections', () => {
    it('should correctly return a positional argument', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<
              { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
              {
                a: [{ c: AnonymousSelectP }, { e: 7 }];
              }
            >,
            3
          >
        >
      ];
    });

    it('should return an error when trying to use several anonymous select', () => {
      type res1 = FindSelected<
        //  ^?
        { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
        {
          a: [{ c: AnonymousSelectP }, { e: AnonymousSelectP }];
        }
      >;

      type cases = [
        Expect<Equal<res1, SeveralAnonymousSelectError>>,
        Expect<
          Equal<
            FindSelected<
              { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
              {
                a: [unknown, { e: AnonymousSelectP }];
                b: AnonymousSelectP;
              }
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [{ c: 3 }, { e: 7 }],
              [{ c: AnonymousSelectP }, { e: AnonymousSelectP }]
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [{ c: 3 }, { e: 7 }],
              [AnonymousSelectP, { e: AnonymousSelectP }]
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [{ c: 3 }, { e: 7 }],
              [AnonymousSelectP, AnonymousSelectP]
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              { type: 'point'; x: number; y: number },
              {
                type: 'point';
                x: AnonymousSelectP;
                y: AnonymousSelectP;
              }
            >,
            SeveralAnonymousSelectError
          >
        >
      ];
    });

    describe('Mix of named and unnamed selections', () => {
      type Input =
        | { type: 'text'; text: string; author: { name: string } }
        | { type: 'video'; duration: number; src: string }
        | {
            type: 'movie';
            duration: number;
            author: { name: string };
            src: string;
            title: string;
          }
        | { type: 'picture'; src: string };

      type cases = [
        Expect<
          Equal<
            FindSelected<
              Input,
              {
                type: 'text';
                text: AnonymousSelectP;
                author: {
                  name: SelectP<'authorName'>;
                };
              }
            >,
            MixedNamedAndAnonymousSelectError
          >
        >
      ];
    });

    describe('No selection', () => {
      it('should return the input type', () => {
        type Input = { type: 'text'; text: string; author: { name: string } };

        type cases = [
          Expect<Equal<FindSelected<Input, { type: 'text' }>, Input>>,
          Expect<
            Equal<FindSelected<{ text: any }, { text: 'text' }>, { text: any }>
          >,
          Expect<
            Equal<
              FindSelected<
                { text: any },
                { str: NotP<null | undefined, null | undefined> }
              >,
              { text: any }
            >
          >,
          Expect<
            Equal<
              FindSelected<{ text: unknown }, { text: 'text' }>,
              { text: unknown }
            >
          >,
          Expect<
            Equal<
              FindSelected<
                { text: unknown },
                { str: NotP<null | undefined, null | undefined> }
              >,
              { text: unknown }
            >
          >
        ];
      });

      it("shouldn't change optional properties", () => {
        type p = {
          type: 'a';
          data: OptionalP<
            | {
                type: 'img';
                src: string;
              }
            | {
                type: 'text';
                p: string;
              }
            | {
                type: 'video';
                src: number;
              }
            | {
                type: 'gif';
                p: string;
              }
            | undefined,
            | {
                type: 'img';
              }
            | undefined
          >;
        };

        type value = {
          type: 'a';
          data?:
            | {
                type: 'img';
                src: string;
              }
            | undefined;
        };

        type t = Expect<Equal<FindSelected<value, p>, value>>;
      });
    });
  });
});
