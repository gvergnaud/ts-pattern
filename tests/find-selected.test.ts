import * as symbols from '../src/symbols';
import {
  FindSelected,
  ListPatternSelection,
  MixedNamedAndAnonymousSelectError,
  Select,
  SeveralAnonymousSelectError,
} from '../src/types/FindSelected';
import { Equal, Expect } from '../src/types/helpers';
import { Matchable } from '../src/types/Pattern';
import { Event, State } from './utils';

type SelectPattern<k extends string> = Matchable<
  unknown,
  never,
  'regular',
  Select<k>,
  unknown
>;

type NotPattern<input, narrowed> = Matchable<input, narrowed, 'not'>;

type OptionalPattern<input, narrowed> = Matchable<input, narrowed, 'optional'>;

type AnonymousSelectPattern = SelectPattern<symbols.anonymousSelectKey>;

describe('FindSelected', () => {
  describe('should correctly return kwargs', () => {
    it('Tuples', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<
              { a: { b: { c: [3] } } },
              {
                a: {
                  b: {
                    c: [SelectPattern<'c'>];
                  };
                };
              }
            >,
            { c: 3 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [State, Event],
              [SelectPattern<'state'>, SelectPattern<'event'>]
            >,
            { state: State; event: Event }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [1, 2, 3],
              [
                SelectPattern<'first'>,
                SelectPattern<'second'>,
                SelectPattern<'third'>
              ]
            >,
            { first: 1; second: 2; third: 3 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [1, 2, 3, 4],
              [
                SelectPattern<'1'>,
                SelectPattern<'2'>,
                SelectPattern<'3'>,
                SelectPattern<'4'>
              ]
            >,
            { '1': 1; '2': 2; '3': 3; '4': 4 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [1, 2, 3, 4, 5],
              [
                SelectPattern<'1'>,
                SelectPattern<'2'>,
                SelectPattern<'3'>,
                SelectPattern<'4'>,
                SelectPattern<'5'>
              ]
            >,
            { '1': 1; '2': 2; '3': 3; '4': 4; '5': 5 }
          >
        >
      ];
    });

    it('list selections should be wrapped in arrays', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<
              State[],
              Matchable<
                unknown,
                unknown,
                'regular',
                ListPatternSelection<SelectPattern<'state'>>
              >
            >,
            { state: State[] }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              State[][],
              Matchable<
                unknown,
                unknown,
                'regular',
                ListPatternSelection<
                  Matchable<
                    unknown,
                    unknown,
                    'regular',
                    ListPatternSelection<SelectPattern<'state'>>
                  >
                >
              >
            >,
            { state: State[][] }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              State[][][],
              Matchable<
                unknown,
                unknown,
                'regular',
                ListPatternSelection<
                  Matchable<
                    unknown,
                    unknown,
                    'regular',
                    ListPatternSelection<
                      Matchable<
                        unknown,
                        unknown,
                        'regular',
                        ListPatternSelection<SelectPattern<'state'>>
                      >
                    >
                  >
                >
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
              { a: { b: { c: SelectPattern<'c'> } } }
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
                  b: { c: SelectPattern<'c'> };
                  d: { e: SelectPattern<'e'> };
                };
              }
            >,
            { c: 3; e: 7 }
          >
        >
      ];
    });

    it('Mixed', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<
              { a: { b: { c: [3, 4] } } },
              { a: { b: { c: [SelectPattern<'c'>, unknown] } } }
            >,
            { c: 3 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
              {
                a: [{ c: SelectPattern<'c'> }, { e: 7 }];
                b: Matchable<
                  unknown,
                  unknown,
                  'regular',
                  ListPatternSelection<{ d: SelectPattern<'d'> }>
                >;
              }
            >,
            { c: 3; d: string[] }
          >
        >
      ];
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
                a: [{ c: AnonymousSelectPattern }, { e: 7 }];
              }
            >,
            3
          >
        >
      ];
    });

    it('should return an error when trying to use several anonymous select', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<
              { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
              {
                a: [
                  { c: AnonymousSelectPattern },
                  { e: AnonymousSelectPattern }
                ];
              }
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
              {
                a: [unknown, { e: AnonymousSelectPattern }];
                b: AnonymousSelectPattern;
              }
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [{ c: 3 }, { e: 7 }],
              [{ c: AnonymousSelectPattern }, { e: AnonymousSelectPattern }]
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [{ c: 3 }, { e: 7 }],
              [AnonymousSelectPattern, { e: AnonymousSelectPattern }]
            >,
            SeveralAnonymousSelectError
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [{ c: 3 }, { e: 7 }],
              [AnonymousSelectPattern, AnonymousSelectPattern]
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
                x: AnonymousSelectPattern;
                y: AnonymousSelectPattern;
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
                text: AnonymousSelectPattern;
                author: {
                  name: SelectPattern<'authorName'>;
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
                { str: NotPattern<null | undefined, null | undefined> }
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
                { str: NotPattern<null | undefined, null | undefined> }
              >,
              { text: unknown }
            >
          >
        ];
      });

      it("shouldn't change optional properties", () => {
        type p = {
          type: 'a';
          data: OptionalPattern<
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
