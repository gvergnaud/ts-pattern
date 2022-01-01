import * as symbols from '../src/symbols';
import {
  FindSelected,
  MixedNamedAndAnonymousSelectError,
  SeveralAnonymousSelectError,
} from '../src/types/FindSelected';
import { Equal, Expect } from '../src/types/helpers';
import {
  Matchable,
  SelectP,
  NotP,
  OptionalP,
  ArrayP,
} from '../src/types/Pattern';
import { Event, State } from './utils';

type AnonymousSelectP = SelectP<symbols.anonymousSelectKey>;

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
                    c: [SelectP<'c'>];
                  };
                };
              }
            >,
            { c: 3 }
          >
        >,
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
      type cases = [
        Expect<
          Equal<
            FindSelected<
              { a: { b: { c: [3, 4] } } },
              { a: { b: { c: [SelectP<'c'>, unknown] } } }
            >,
            { c: 3 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
              {
                a: [{ c: SelectP<'c'> }, { e: 7 }];
                b: Matchable<unknown, { d: SelectP<'d'> }, 'array'>;
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
                a: [{ c: AnonymousSelectP }, { e: 7 }];
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
                a: [{ c: AnonymousSelectP }, { e: AnonymousSelectP }];
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
