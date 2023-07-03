import * as P from './patterns';
import { PatternMatcher } from './types/Pattern';
import { Equal } from './types/helpers';

const tagKey = '_tag';
type tagKey = typeof tagKey;

export type Variant<k, d = undefined> = { [tagKey]: k; value: d };

/**
 * VariantPatterns can be used to match a Variant in a
 * `match` expression.
 */
type VariantPattern<input, k, p> = { [tagKey]: k; value: p };

type AnyVariant = Variant<string, unknown>;

type Narrow<variant extends AnyVariant, k extends variant[tagKey]> = Extract<
  variant,
  Variant<k, {}>
>;

type Constructor<variant extends AnyVariant> = variant extends {
  [tagKey]: infer tag;
  value: infer value;
}
  ? Equal<value, undefined> extends true
    ? () => Variant<tag>
    : Equal<value, unknown> extends true
    ? <t extends value>(value: t) => Variant<tag, t>
    : {
        (value: value): variant;
        <input, const p extends PatternMatcher<input>>(
          pattern: p
        ): VariantPattern<input, tag, p>;
      }
  : never;

type Impl<variants extends AnyVariant> = {
  [variant in variants as variant[tagKey]]: Constructor<variant>;
};

export function implementVariants<variant extends AnyVariant>(): Impl<variant> {
  return new Proxy({} as Impl<variant>, {
    get: <k extends keyof Impl<variant>>(_: Impl<variant>, tag: k) => {
      return (...args: [value?: Narrow<variant, k>]) => ({
        [tagKey]: tag,
        ...(args.length === 0 ? {} : args[0]),
      });
    },
  });
}
