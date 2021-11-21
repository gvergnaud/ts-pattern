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
export const Guard = Symbol('@ts-pattern/guard');
export type Guard = typeof Guard;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const Variable = Symbol('@ts-pattern/variable');
export type Variable = typeof Variable;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const NamedSelect = Symbol('@ts-pattern/named-select');
export type NamedSelect = typeof NamedSelect;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const AnonymousSelect = Symbol('@ts-pattern/anonymous-select');
export type AnonymousSelect = typeof AnonymousSelect;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const not = Symbol('@ts-pattern/not');
export type not = typeof not;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const list = Symbol('@ts-pattern/list');
export type list = typeof list;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const optional = Symbol('@ts-pattern/optional');
export type optional = typeof optional;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const or = Symbol('@ts-pattern/or');
export type or = typeof or;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const and = Symbol('@ts-pattern/and');
export type and = typeof and;
