import { FindSelected } from '../src/types/FindSelected';
import { Equal, Expect } from '../src/types/helpers';
import { SelectPattern } from '../src/types/Pattern';
import { Event, State } from './utils';

describe('FindSelected', () => {
  describe('should correctly return a Union of all selected values', () => {
    it('Tuples', () => {
      type cases = [
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

    it('Arrays values should be wrapped in arrays', () => {
      type cases = [
        Expect<
          Equal<
            FindSelected<State[], [SelectPattern<'state'>]>,
            { state: State[] }
          >
        >,
        Expect<
          Equal<
            FindSelected<State[][], [[SelectPattern<'state'>]]>,
            { state: State[][] }
          >
        >,
        Expect<
          Equal<
            FindSelected<State[][][], [[[SelectPattern<'state'>]]]>,
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
                b: { d: SelectPattern<'d'> }[];
              }
            >,
            { c: 3; d: string[] }
          >
        >
      ];
    });
  });
});
