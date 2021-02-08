import type { PatternType, __ } from '../PatternType';
import { IsPlainObject } from './helpers';
import type {
  SelectPattern,
  GuardPattern,
  NotPattern,
  Primitives,
} from './Pattern';

export type PatternPlaceholder = { __placeholder: '@match/placeholder' };

/**
 * ### InvertPattern
 * Since patterns have special wildcard values, we need a way
 * to transform a pattern into the type of value it represents
 */
export type InvertPattern<p> = p extends typeof __.number
  ? number
  : p extends typeof __.string
  ? string
  : p extends typeof __.boolean
  ? boolean
  : p extends SelectPattern<string>
  ? PatternPlaceholder
  : p extends typeof __
  ? PatternPlaceholder
  : p extends GuardPattern<any, infer pb>
  ? pb
  : p extends NotPattern<infer pb>
  ? {
      valueKind: PatternType.Not;
      value: InvertPattern<pb>;
    }
  : p extends Primitives
  ? p
  : p extends (infer pp)[]
  ? p extends [infer pb, infer pc, infer pd, infer pe, infer pf]
    ? [
        InvertPattern<pb>,
        InvertPattern<pc>,
        InvertPattern<pd>,
        InvertPattern<pe>,
        InvertPattern<pf>
      ]
    : p extends [infer pb, infer pc, infer pd, infer pe]
    ? [
        InvertPattern<pb>,
        InvertPattern<pc>,
        InvertPattern<pd>,
        InvertPattern<pe>
      ]
    : p extends [infer pb, infer pc, infer pd]
    ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>]
    : p extends [infer pb, infer pc]
    ? [InvertPattern<pb>, InvertPattern<pc>]
    : InvertPattern<pp>[]
  : p extends Map<infer pk, infer pv>
  ? Map<pk, InvertPattern<pv>>
  : p extends Set<infer pv>
  ? Set<InvertPattern<pv>>
  : IsPlainObject<p> extends true
  ? { [k in keyof p]: InvertPattern<p[k]> }
  : p;
