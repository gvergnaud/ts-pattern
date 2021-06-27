import { PatternType } from './PatternType';
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
  '@ts-pattern/__patternKind': PatternType.Guard,
  '@ts-pattern/__when': predicate,
});

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  '@ts-pattern/__patternKind': PatternType.Not,
  '@ts-pattern/__pattern': pattern,
});

export const ANONYMOUS_SELECT_KEY = '@ts-pattern/__anonymous-select-key';

export function select(): AnonymousSelectPattern;
export function select<k extends string>(key: k): NamedSelectPattern<k>;
export function select<k extends string>(
  key?: k
): AnonymousSelectPattern | NamedSelectPattern<k> {
  return key === undefined
    ? {
        '@ts-pattern/__patternKind': PatternType.AnonymousSelect,
      }
    : {
        '@ts-pattern/__patternKind': PatternType.NamedSelect,
        '@ts-pattern/__key': key,
      };
}
