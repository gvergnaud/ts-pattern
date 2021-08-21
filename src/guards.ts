import * as symbols from './symbols';
import {
  AnonymousSelectPattern,
  AnonymousSelectOrPattern,
  GuardFunction,
  GuardPattern,
  NamedSelectPattern,
  NamedSelectOrPattern,
  NotPattern,
  Pattern,
} from './types/Pattern';

export const when = <a, b extends a = never>(
  predicate: GuardFunction<a, b>
): GuardPattern<a, b> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: predicate,
});

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  [symbols.PatternKind]: symbols.Not,
  [symbols.Not]: pattern,
});

export const ANONYMOUS_SELECT_KEY = '@ts-pattern/__anonymous-select-key';

export function select(): AnonymousSelectPattern;
export function select<k extends string>(key: k): NamedSelectPattern<k>;
export function select<k extends string>(
  key?: k
): AnonymousSelectPattern | NamedSelectPattern<k> {
  return key === undefined
    ? {
        [symbols.PatternKind]: symbols.AnonymousSelect,
      }
    : {
        [symbols.PatternKind]: symbols.NamedSelect,
        [symbols.NamedSelect]: key,
      };
}

export function selectOr<r>(defaultValue: r): AnonymousSelectOrPattern<r>;
export function selectOr<r, k extends string>(
  defaultValue: r,
  key: k
): NamedSelectOrPattern<r, k>;
export function selectOr<r, k extends string>(
  defaultValue: r,
  key?: k
): AnonymousSelectOrPattern<r> | NamedSelectOrPattern<r, k> {
  return key === undefined
    ? {
        [symbols.PatternKind]: symbols.AnonymousSelectOr,
        [symbols.DefaultValue]: defaultValue,
      }
    : {
        [symbols.PatternKind]: symbols.NamedSelectOr,
        [symbols.NamedSelect]: key,
        [symbols.DefaultValue]: defaultValue,
      };
}

type AnyConstructor = new (...args: any[]) => any;

function isInstanceOf<T extends AnyConstructor>(classConstructor: T) {
  return (val: unknown): val is InstanceType<T> =>
    val instanceof classConstructor;
}
export const instanceOf = <T extends AnyConstructor>(classConstructor: T) =>
  when(isInstanceOf(classConstructor));
