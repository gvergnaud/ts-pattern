import { __ } from './wildcards';
import { Compute } from './types/helpers';
import {
  AnonymousSelectPattern,
  NamedSelectPattern,
  Pattern,
} from './types/Pattern';

type ValueContainer<d> = d extends { tag: string }
  ? { value: d }
  : d extends object
  ? d
  : { value: d };

export type Variant<k, d = never> = Compute<
  [d] extends [never] ? { tag: k } : { tag: k } & ValueContainer<d>
>;

/**
 * VariantPatterns can be used to match a Variant in a
 * `match` expression.
 */
type VariantPattern<k, p = never> = { tag: k } & ([p] extends [never]
  ? {}
  : p extends AnonymousSelectPattern | NamedSelectPattern<string>
  ? p
  : ValueContainer<p>);

type AnyVariant = { tag: string };

type Narrow<variant extends AnyVariant, k extends variant['tag']> = Extract<
  variant,
  { tag: k }
>;

type Constructor<k, v> = [v] extends [never]
  ? () => Variant<k>
  : unknown extends v
  ? {
      <t>(value: t): { tag: k } & ValueContainer<t>;
      (catchall: typeof __): VariantPattern<k>;
    }
  : {
      (value: v): Variant<k, v>;
      (catchall: typeof __): VariantPattern<k>;
      <p extends Pattern<v>>(pattern: p): VariantPattern<k, p>;
    };

type Impl<variant extends AnyVariant> = {
  [k in variant['tag']]: Constructor<
    k,
    Narrow<variant, k> extends { value: infer v }
      ? v
      : keyof Narrow<variant, k> extends 'tag'
      ? never
      : Compute<Omit<Narrow<variant, k>, 'tag'>>
  >;
};

export function implementVariants<variant extends AnyVariant>(): Impl<variant> {
  return new Proxy({} as Impl<variant>, {
    get: <k extends keyof Impl<variant>>(_: Impl<variant>, tag: k) => {
      return (...args: [value?: any]) => ({
        tag,
        ...(args.length === 0
          ? {}
          : args[0] === __
          ? {}
          : typeof args[0] === 'object'
          ? 'tag' in args[0]
            ? { value: args[0] }
            : args[0]
          : { value: args[0] }),
      });
    },
  });
}
