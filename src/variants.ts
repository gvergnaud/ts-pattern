import { Compute } from './types/helpers';
import { Pattern } from './types/Pattern';

export type Variant<k, d = never> = Compute<{ tag: k; value: d }>;

type AnyVariant = Variant<string, unknown>;

type Narrow<variant extends AnyVariant, k extends variant['tag']> = Extract<
  variant,
  Variant<k, unknown>
>;

type Constructor<k, v> = [v] extends [never]
  ? () => Variant<k>
  : unknown extends v
  ? <t>(value: t) => Variant<k, t>
  : {
      (value: v): Variant<k, v>;
      <p extends Pattern<v>>(pattern: p): Variant<k, p>;
    };

type Impl<variant extends AnyVariant> = {
  [k in variant['tag']]: Constructor<k, Narrow<variant, k>['value']>;
};

export function implementVariants<variant extends AnyVariant>(): Impl<variant> {
  return new Proxy({} as Impl<variant>, {
    get: <k extends keyof Impl<variant>>(_: Impl<variant>, tag: k) => {
      return (...args: [value?: Narrow<variant, k>['value']]) => ({
        tag,
        ...(args.length === 0 ? {} : { value: args[0] }),
      });
    },
  });
}
