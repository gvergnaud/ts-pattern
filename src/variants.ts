import { __ } from './wildcards';
import { Compute } from './types/helpers';
import {
  AnonymousSelectPattern,
  NamedSelectPattern,
  Pattern,
} from './types/Pattern';
import { select } from './guards';

type ValueContainer<d> = d extends { _tag: string }
  ? { value: d }
  : d extends object
  ? d
  : { value: d };

export type Variant<k, d = never> = Compute<
  [d] extends [never] ? { _tag: k } : { _tag: k } & ValueContainer<d>
>;

/**
 * VariantPatterns can be used to match a Variant in a
 * `match` expression.
 */
type VariantPattern<k, p = never> = { _tag: k } & ([p] extends
  | [never]
  | [typeof __]
  ? {}
  : p extends AnonymousSelectPattern | NamedSelectPattern<string>
  ? p
  : ValueContainer<p>);

type AnyVariant = { _tag: string };

type Narrow<variant extends AnyVariant, k extends variant['_tag']> = Extract<
  variant,
  { _tag: k }
>;

type Constructor<k, v> = [v] extends [never]
  ? () => Variant<k>
  : unknown extends v
  ? {
      <t>(value: t): { _tag: k } & ValueContainer<t>;
      <p extends Pattern<v>>(pattern: p): VariantPattern<k, p>;
    }
  : {
      (value: v): Variant<k, v>;
      <p extends Pattern<v>>(pattern: p): VariantPattern<k, p>;
    };

type Impl<variant extends AnyVariant> = {
  [k in variant['_tag']]: Constructor<
    k,
    Narrow<variant, k> extends { value: infer v }
      ? v
      : keyof Narrow<variant, k> extends '_tag'
      ? never
      : Compute<Omit<Narrow<variant, k>, '_tag'>>
  >;
};

export function implementVariants<variant extends AnyVariant>(): Impl<variant> {
  return new Proxy({} as Impl<variant>, {
    get: <k extends keyof Impl<variant>>(_: Impl<variant>, _tag: k) => {
      return (...args: [value?: any]) =>
        args.length === 0 || args[0] === __
          ? { _tag }
          : args[0] !== null &&
            typeof args[0] === 'object' &&
            !('_tag' in args[0])
          ? { _tag, ...args[0] }
          : { _tag, value: args[0] };
    },
  });
}
