import { isMatching, match, P } from '../src';
import type {
  InvertPattern,
  InvertPatternForExclude,
} from '../src/types/InvertPattern';
import { Expect, Equal } from '../src/types/helpers';
import type { StandardSchemaV1 } from '../src/types/standard-schema/standard-schema-v1';
import { z } from 'zod';

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(z.enum(['admin', 'member'])),
  profile: z.object({
    tags: z.array(z.string().min(1)),
    active: z.boolean(),
  }),
});

const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type Project = P.infer<typeof projectSchema>;

type User = P.infer<typeof userSchema>;

type _expectUser = Expect<
  Equal<
    User,
    {
      id: string;
      email: string;
      roles: ('admin' | 'member')[];
      profile: {
        tags: string[];
        active: boolean;
      };
    }
  >
>;

type _expectProject = Expect<
  Equal<
    Project,
    {
      id: string;
      name: string;
      description: string;
      createdAt: Date;
      updatedAt: Date;
    }
  >
>;

type _invertMatchesOutput = Expect<
  Equal<InvertPattern<typeof userSchema, unknown>, User>
>;

describe('Standard Schema V1 integration with Zod', () => {
  it('matches and narrows complex zod schema', () => {
    const value: unknown = {
      id: '8e08482a-7306-4cc7-9331-4a61c3b17c6d',
      email: 'alice@example.com',
      roles: ['admin', 'member'],
      profile: {
        tags: ['onboarded', 'beta'],
        active: true,
      },
    };

    const result = match(value)
      .with(userSchema, (user) => user.email.toUpperCase())
      .otherwise(() => 'no match');

    expect(result).toEqual('ALICE@EXAMPLE.COM');
  });

  it('fails to match invalid data', () => {
    const value = {
      id: 'invalid-uuid',
      email: 'not-an-email',
      roles: ['guest'],
      profile: {
        tags: [],
        active: false,
      },
    };

    const result = match(value as unknown)
      .with(userSchema, () => 'matched')
      .otherwise(() => 'invalid');

    expect(result).toEqual('invalid');
  });

  it('supports nested object patterns alongside other matchers', () => {
    type Input =
      | { kind: 'thing'; payload: User | Project }
      | { kind: 'error'; error: string };

    const input: Input = {
      kind: 'thing',
      payload: {
        id: 'aa27f0c5-c188-4556-8fda-e513dc9564c9',
        email: 'nested@example.com',
        roles: ['member'],
        profile: {
          tags: ['nested'],
          active: true,
        },
      },
    };

    const message = match<Input>(input)
      .with({ kind: 'thing', payload: userSchema }, ({ payload }) => {
        type _narrowed = Expect<Equal<typeof payload, User>>;
        return `user:${payload.id}`;
      })
      .with({ kind: 'thing', payload: projectSchema }, ({ payload }) => {
        type _narrowed = Expect<Equal<typeof payload, Project>>;
        return `project:${payload.id}`;
      })
      .with({ kind: 'error', error: P.string }, ({ error }) => error)
      .exhaustive();

    expect(message).toEqual('user:aa27f0c5-c188-4556-8fda-e513dc9564c9');
  });

  it('isMatching acts as a type guard for standard schemas', () => {
    const guard = isMatching(userSchema);
    let value: unknown = {
      id: '4cb4e4bb-b9c2-406b-a86c-047fae2f6a0a',
      email: 'guard@example.com',
      roles: ['admin'],
      profile: {
        tags: ['guard'],
        active: false,
      },
    };

    expect(guard(value)).toBe(true);

    if (guard(value)) {
      type _guardNarrow = Expect<Equal<typeof value, User>>;
    }

    value = {
      id: 'missing-fields',
      roles: [],
      profile: {
        tags: [],
        active: true,
      },
    };

    expect(guard(value)).toBe(false);
  });

  it('should support inline zod schemas', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().min(18),
    });

    type IO<T> = T extends StandardSchemaV1<infer I, infer O>
      ? { input: I; output: O }
      : never;

    const fn = (input: { name: string; age: number }) => {
      return (
        match(input)
          .with(schema, (data) => data.name)
          // @ts-expect-error
          .exhaustive()
      );
    };
  });
});
