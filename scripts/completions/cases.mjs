// Completion cases for `npm run completions`.
//
// `§` marks where the cursor is when the file is opened. `type` is then typed
// key by key from there, like in an editor: a quote inserts a pair of quotes
// and puts the cursor between them. Completions are asked after each key.

const union = `import { match, P } from '../../../src';

declare const input:
  | { type: 'allo'; test: string }
  | { type: 'coucou'; jambon: number; test: boolean };
`;

const literals = `import { match, P } from '../../../src';

declare const input: 'north' | 'south' | 'east' | 'west';
`;

export const cases = [
  {
    name: 'no handler, string | boolean property',
    code: union + `match(input).with({ test: § });\n`,
    type: '"a',
  },
  {
    name: 'no handler, discriminant',
    code: union + `match(input).with({ type: § });\n`,
    type: '"a',
  },
  {
    name: 'no handler, discriminant then string property',
    code: union + `match(input).with({ type: 'allo', test: § });\n`,
    type: '"a',
  },
  {
    name: 'no handler, single quotes',
    code: union + `match(input).with({ type: § });\n`,
    type: "'c",
  },
  {
    name: 'with handler, discriminant',
    code: union + `match(input).with({ type: § }, () => 1);\n`,
    type: '"a',
  },
  {
    name: 'second .with() in a chain',
    code:
      union +
      `match(input)\n  .with({ type: 'allo' }, () => 1)\n  .with({ type: § }, () => 2);\n`,
    type: '"c',
  },
  {
    name: 'no handler, nested object',
    code: `import { match, P } from '../../../src';

declare const input: { user: { role: 'admin' | 'editor' | 'viewer' } };
match(input).with({ user: { role: § } });
`,
    type: '"e',
  },
  {
    name: 'no handler, array',
    code: `import { match, P } from '../../../src';

declare const input: { tags: ('red' | 'green' | 'blue')[] };
match(input).with({ tags: [§] });
`,
    type: '"r',
  },
  {
    name: 'no handler, tuple',
    code: `import { match, P } from '../../../src';

declare const input: ['get' | 'post', number];
match(input).with([§]);
`,
    type: '"g',
  },
  {
    name: 'no handler, P.union()',
    code: union + `match(input).with({ type: P.union(§) });\n`,
    type: '"c',
  },
  {
    name: 'no handler, literal union input',
    code: literals + `match(input).with(§);\n`,
    type: '"n',
  },
  {
    name: 'with handler, literal union input',
    code: literals + `match(input).with(§, () => 1);\n`,
    type: '"n',
  },
  {
    name: '2 patterns, second one',
    code:
      union + `match(input).with({ type: 'allo' }, { type: § }, () => 1);\n`,
    type: '"c',
  },
  {
    name: '3 patterns, third one',
    code: literals + `match(input).with('north', 'south', §, () => 1);\n`,
    type: '"e',
  },
  {
    name: 'pattern + guard',
    code: union + `match(input).with({ type: § }, (x) => true, () => 1);\n`,
    type: '"a',
  },
  // Keys of object patterns.
  {
    name: 'keys, no handler, empty object',
    code: union + `match(input).with({ § });\n`,
    type: '',
  },
  {
    name: 'keys, no handler, after a discriminant',
    code: union + `match(input).with({ type: 'coucou', § });\n`,
    type: '',
  },
  {
    name: 'keys, no handler, after a discriminant, typing',
    code: union + `match(input).with({ type: 'coucou', § });\n`,
    type: 'j',
  },
  {
    name: 'keys, with handler, empty object',
    code: union + `match(input).with({ § }, () => 1);\n`,
    type: '',
  },
  {
    name: 'keys, no handler, nested object',
    code: `import { match, P } from '../../../src';

declare const input: { user: { role: 'admin' | 'editor'; name: string } };
match(input).with({ user: { § } });
`,
    type: '',
  },
];
