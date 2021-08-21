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
export const Not = Symbol('@ts-pattern/not');
export type Not = typeof Not;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const NamedSelect = Symbol('@ts-pattern/named-select');
export type NamedSelect = typeof NamedSelect;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const AnonymousSelect = Symbol('@ts-pattern/anonymous-select');
export type AnonymousSelect = typeof AnonymousSelect;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const DefaultValue = Symbol('@ts-pattern/default-value');
export type DefaultValue = typeof DefaultValue;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const NamedSelectOr = Symbol('@ts-pattern/named-select-or');
export type NamedSelectOr = typeof NamedSelectOr;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const AnonymousSelectOr = Symbol('@ts-pattern/anonymous-select-or');
export type AnonymousSelectOr = typeof AnonymousSelectOr;

/** @internal This symbol should only be used by ts-pattern's internals. */
export const None = Symbol('@ts-pattern/none');
export type None = typeof None;
