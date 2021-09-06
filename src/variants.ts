import { __ } from './wildcards';
import { Compute } from './types/helpers';
import {
  AnonymousSelectPattern,
  NamedSelectPattern,
  Pattern,
} from './types/Pattern';

export type Variant<k, d = never> = Compute<
  [d] extends [never]
    ? { tag: k }
    : { tag: k } & (d extends object ? d : { value: d })
>;

type VariantPattern<k> = { tag: k };

/**
 * VariantPatterns can be used to match a Variant in a
 * `match` expression.
 */
type VariantValuePattern<k, p> = { tag: k } & (p extends
  | AnonymousSelectPattern
  | NamedSelectPattern<string>
  ? p
  : p extends object
  ? p
  : { value: p });

type AnyVariant = { tag: string };

type Narrow<variant extends AnyVariant, k extends variant['tag']> = Extract<
  variant,
  { tag: k }
>;

type Constructor<k, v> = [v] extends [never]
  ? () => Variant<k>
  : unknown extends v
  ? {
      <t>(value: t): { tag: k } & (t extends object ? t : { value: t });
      (): VariantPattern<k>;
    }
  : {
      (value: v): Variant<k, v>;
      (): VariantPattern<k>;
      <p extends Pattern<v>>(pattern: p): VariantValuePattern<k, p>;
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
          : typeof args[0] === 'object'
          ? args[0]
          : { value: args[0] }),
      });
    },
  });
}
