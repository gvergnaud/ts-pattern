import {
  FindSelected,
  MixedNamedAndAnonymousSelectError,
  SeveralAnonymousSelectError,
} from '../src/types/FindSelected';
import { Equal, Expect } from '../src/types/helpers';
import {
  AnonymousSelectPattern,
  NamedSelectPattern,
  NotPattern,
} from '../src/types/Pattern';
import { Event, State } from './utils';

describe('FindSelected', () => {
  describe('should correctly return kwargs', () => {
    it('Tuples', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<
              [State, Event],
              [NamedSelectPattern<'state'>, NamedSelectPattern<'event'>]
            >,
            { state: State; event: Event }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              [1, 2, 3],
              [
                NamedSelectPattern<'first'>,
                NamedSelectPattern<'second'>,
                NamedSelectPattern<'third'>
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
                NamedSelectPattern<'1'>,
                NamedSelectPattern<'2'>,
                NamedSelectPattern<'3'>,
                NamedSelectPattern<'4'>
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
                NamedSelectPattern<'1'>,
                NamedSelectPattern<'2'>,
                NamedSelectPattern<'3'>,
                NamedSelectPattern<'4'>,
                NamedSelectPattern<'5'>
              ]
            >,
            { '1': 1; '2': 2; '3': 3; '4': 4; '5': 5 }
          >
        >
      ];
    });

    it('Arrays values should be wrapped in arrays', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<State[], [NamedSelectPattern<'state'>]>,
            { state: State[] }
          >
        >,
        Expect<
          Equal<
            FindSelected<State[][], [[NamedSelectPattern<'state'>]]>,
            { state: State[][] }
          >
        >,
        Expect<
          Equal<
            FindSelected<State[][][], [[[NamedSelectPattern<'state'>]]]>,
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
              { a: { b: { c: NamedSelectPattern<'c'> } } }
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
                  b: { c: NamedSelectPattern<'c'> };
                  d: { e: NamedSelectPattern<'e'> };
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
              { a: { b: { c: [NamedSelectPattern<'c'>, unknown] } } }
            >,
            { c: 3 }
          >
        >,
        Expect<
          Equal<
            FindSelected<
              { a: [{ c: 3 }, { e: 7 }]; b: { d: string }[] },
              {
                a: [{ c: NamedSelectPattern<'c'> }, { e: 7 }];
                b: { d: NamedSelectPattern<'d'> }[];
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
                  name: NamedSelectPattern<'authorName'>;
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
          Expect<Equal<FindSelected<Input, { type: 'text' }>, Input>>
        ];
      });

      it('should return the input type', () => {
        type Input = { text: any };

        type cases = [
          Expect<Equal<FindSelected<Input, { text: 'text' }>, Input>>,
          Expect<
            Equal<
              FindSelected<Input, { str: NotPattern<null | undefined> }>,
              Input
            >
          >
        ];
      });
    });
  });
});
