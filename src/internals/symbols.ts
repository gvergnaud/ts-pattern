/**
 * Symbols used internally within ts-pattern to construct and discriminate
 * Guard, Not, and Select, and AnonymousSelect patterns
 *
 * Symbols have the advantage of not appearing in auto-complete suggestions in
 * user defined patterns, and eliminate the risk of property
 * overlap between ts-pattern internals and user defined patterns.
 *
 * These symbols have to be visible to tsc for type inference to work, but
 * users should not import them
 * @module
 * @private
 * @internal
 */

export const toExclude = Symbol('@ts-pattern/to-exclude');
export type toExclude = typeof toExclude;

export const matcher = Symbol('@ts-pattern/matcher');
export type matcher = typeof matcher;

export const unset = Symbol('@ts-pattern/unset');
export type unset = typeof unset;

export const isVariadic = Symbol('@ts-pattern/isVariadic');
export type isVariadic = typeof isVariadic;

export const anonymousSelectKey = '@ts-pattern/anonymous-select-key';
export type anonymousSelectKey = typeof anonymousSelectKey;
