import type { PatternType, __ } from '../PatternType';
import type {
  SelectPattern,
  GuardPattern,
  NotPattern,
  Primitives,
} from './Pattern';

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
  ? typeof __
  : p extends typeof __
  ? typeof __
  : p extends GuardPattern<infer pa, infer pb>
  ? pb
  : p extends NotPattern<infer pb>
  ? {
      valueKind: PatternType.Not;
      value: InvertPattern<pb>;
    }
  : p extends Primitives
  ? p
  : p extends [infer pb, infer pc, infer pd, infer pe, infer pf]
  ? [
      InvertPattern<pb>,
      InvertPattern<pc>,
      InvertPattern<pd>,
      InvertPattern<pe>,
      InvertPattern<pf>
    ]
  : p extends [infer pb, infer pc, infer pd, infer pe]
  ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>, InvertPattern<pe>]
  : p extends [infer pb, infer pc, infer pd]
  ? [InvertPattern<pb>, InvertPattern<pc>, InvertPattern<pd>]
  : p extends [infer pb, infer pc]
  ? [InvertPattern<pb>, InvertPattern<pc>]
  : p extends (infer pp)[]
  ? InvertPattern<pp>[]
  : p extends Map<infer pk, infer pv>
  ? Map<pk, InvertPattern<pv>>
  : p extends Set<infer pv>
  ? Set<InvertPattern<pv>>
  : p extends object
  ? { [k in keyof p]: InvertPattern<p[k]> }
  : p;
