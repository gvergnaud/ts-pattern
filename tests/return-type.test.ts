import { P, match } from '../src';

describe('returnType', () => {
  it('should only be allowed directly after match(...)', () => {
    const f = (input: unknown) =>
      match(input)
        .returnType<string>() // allowed
        .with(undefined, () => 'undefined')
        .with(P.string, () => 'string')
        .otherwise(() => 'unknown');

    const f2 = (input: unknown) =>
      match(input)
        .with(undefined, () => 'undefined')
        // @ts-expect-error: not allowed
        .returnType<string>()
        .with(P.string, () => 'string')
        .otherwise(() => 'unknown');

    const f3 = (input: unknown) =>
      match(input)
        .with(undefined, () => 'undefined')
        .with(P.string, () => 'string')
        // @ts-expect-error: not allowed
        .returnType<string>()
        .otherwise(() => 'unknown');
  });

  it('should restrict the return type to a specific type', () => {
    const f = (input: string | undefined): string =>
      match(input)
        .returnType<string>()
        // @ts-expect-error
        .with(undefined, () => undefined)
        .with(P.string, () => 'string')
        // @ts-expect-error
        .otherwise(() => true);
  });

  it('type errors should be well placed', () => {
    match<null>(null)
      .returnType<{ type: 'ok'; value: 'a' | 'b' }>()
      .with(null, () => ({
        type: 'ok',
        // @ts-expect-error
        value: 'oops',
      }))
      .exhaustive();
  });
});
