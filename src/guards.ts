import * as symbols from './symbols';
import {
  AnonymousSelectPattern,
  GuardFunction,
  GuardPattern,
  SelectPattern,
  NotPattern,
  Pattern,
  MatchProtocolPattern,
} from './types/Pattern';

export const when = <input, output extends input = never>(
  predicate: GuardFunction<input, output>
): GuardPattern<input, output> => ({
  [symbols.PatternKind]: symbols.Guard,
  [symbols.Guard]: predicate,
});

export const pattern = <
  key extends string,
  p extends (value: any) => unknown,
  selected
>(
  predicate: p,
  selector: p extends (value: any) => value is infer N
    ? (value: N) => { key: key; value: selected }
    : never
): MatchProtocolPattern<key, p, typeof selector> => ({
  [symbols.PatternKind]: symbols.MatchProtocol,
  [symbols.MatchProtocol]: { predicate, selector },
});

export const not = <a>(pattern: Pattern<a>): NotPattern<a> => ({
  [symbols.PatternKind]: symbols.Not,
  [symbols.Not]: pattern,
});

export function select(): AnonymousSelectPattern;
export function select<k extends string>(key: k): SelectPattern<k>;
export function select<k extends string>(
  key?: k
): AnonymousSelectPattern | SelectPattern<k> {
  return key === undefined
    ? {
        [symbols.PatternKind]: symbols.Select,
        [symbols.Select]: symbols.AnonymousSelectKey,
      }
    : {
        [symbols.PatternKind]: symbols.Select,
        [symbols.Select]: key,
      };
}

type AnyConstructor = new (...args: any[]) => any;

function isInstanceOf<T extends AnyConstructor>(classConstructor: T) {
  return (val: unknown): val is InstanceType<T> =>
    val instanceof classConstructor;
}
export const instanceOf = <T extends AnyConstructor>(classConstructor: T) =>
  when(isInstanceOf(classConstructor));
