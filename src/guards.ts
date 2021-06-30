import * as PatternType from './symbols';
import {
  AnonymousSelectPattern,
  GuardFunction,
  GuardPattern,
  NamedSelectPattern,
  NotPattern,
  Pattern,
} from './types/Pattern';

export const when = <a, b extends a = never>(
  predicate: GuardFunction<a, b>
): GuardPattern<a, b> => ({
  [PatternType.PatternKind]: PatternType.Guard,
  [PatternType.Guard]: predicate,
});

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  [PatternType.PatternKind]: PatternType.Not,
  [PatternType.Not]: pattern,
});

export const ANONYMOUS_SELECT_KEY = '@ts-pattern/__anonymous-select-key';

export function select(): AnonymousSelectPattern;
export function select<k extends string>(key: k): NamedSelectPattern<k>;
export function select<k extends string>(
  key?: k
): AnonymousSelectPattern | NamedSelectPattern<k> {
  return key === undefined
    ? {
        [PatternType.PatternKind]: PatternType.AnonymousSelect,
      }
    : {
        [PatternType.PatternKind]: PatternType.NamedSelect,
        [PatternType.NamedSelect]: key,
      };
}
