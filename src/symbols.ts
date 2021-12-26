/**
 * Symbols used internally within ts-pattern to construct and discriminate
 * Guard, Not, and Select, and AnonymousSelect patterns
 *
 * Symbols have the advantage of not appearing in auto-complete suggestions in
 * user defined patterns, and eliminate the admittedly unlikely risk of property
 * overlap between ts-pattern internals and user defined patterns.
 *
 * These symbols have to be visible to tsc for type inference to work, but
 * users should not import them
 * @module
 * @private
 * @internal
 */

/** @internal This symbol should only be used by ts-pattern's internals. */
export const PatternKind = Symbol('@ts-pattern/pattern-kind');
export type PatternKind = typeof PatternKind;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const Pattern = Symbol('@ts-pattern/pattern');
export type Pattern = typeof Pattern;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const ToExclude = Symbol('@ts-pattern/to-exclude');
export type ToExclude = typeof ToExclude;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const Guard = Symbol('@ts-pattern/guard');
export type Guard = typeof Guard;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const Selector = Symbol('@ts-pattern/selector');
export type Selector = typeof Selector;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const Not = Symbol('@ts-pattern/not');
export type Not = typeof Not;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const Select = Symbol('@ts-pattern/select');
export type Select = typeof Select;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const MatchProtocol = Symbol('@ts-pattern/match-protocol');
export type MatchProtocol = typeof MatchProtocol;

export const AnonymousSelectKey = '@ts-pattern/__anonymous-select-key';
export type AnonymousSelectKey = typeof AnonymousSelectKey;
