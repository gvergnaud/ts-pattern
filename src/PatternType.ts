/** @internal This property should only be used by ts-pattern's internals. */
export const PatternKind = Symbol('@ts-pattern/pattern-kind');
/** @internal This property should only be used by ts-pattern's internals. */
export type PatternKind = typeof PatternKind;

/** @internal This property should only be used by ts-pattern's internals. */
export const Guard = Symbol('@ts-pattern/guard');
/** @internal This property should only be used by ts-pattern's internals. */
export type Guard = typeof Guard;

/** @internal This property should only be used by ts-pattern's internals. */
export const Not = Symbol('@ts-pattern/not');
/** @internal This property should only be used by ts-pattern's internals. */
export type Not = typeof Not;

/** @internal This property should only be used by ts-pattern's internals. */
export const NamedSelect = Symbol('@ts-pattern/named-select');
/** @internal This property should only be used by ts-pattern's internals. */
export type NamedSelect = typeof NamedSelect;

/** @internal This property should only be used by ts-pattern's internals. */
export const AnonymousSelect = Symbol('@ts-pattern/anonymous-select');
/** @internal This property should only be used by ts-pattern's internals. */
export type AnonymousSelect = typeof AnonymousSelect;
