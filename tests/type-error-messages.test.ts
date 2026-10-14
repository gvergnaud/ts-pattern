import * as ts from 'typescript';

/**
 * `@ts-expect-error` checks that there is an error, not what it says.
 * These tests type-check invalid patterns with the TypeScript compiler API
 * and check the text of the errors: they must name the expected pattern
 * type (`Pattern<...>`), never an internal type.
 */

const header = `
import { match, P } from '../src';

type Input =
  | { type: 'alpha'; id: { value: number; items: string[] } }
  | { type: 'beta'; count: number };

declare const input: Input;
declare const n: number;
declare const lit: 'a' | 'b';
declare const tuple: [string, number];
declare const opt: { name?: string; tags: string[] };
`;

const getErrors = (() => {
  let cache: Map<string, string[]> | undefined;
  return (cases: Record<string, string>) => {
    if (cache) return cache;
    // The repo's root, found from the working directory.
    const jestConfig = ts.findConfigFile(
      ts.sys.getCurrentDirectory(),
      ts.sys.fileExists,
      'jest.config.cjs'
    );
    if (!jestConfig) throw new Error('jest.config.cjs not found');
    const testsDir = jestConfig.replace(/jest\.config\.cjs$/, 'tests');
    // Virtual files, next to the other tests so that `../src` resolves.
    const files = new Map(
      Object.entries(cases).map(([name, code]) => [
        `${testsDir}/__type-error-messages__${name}.ts`,
        header + code,
      ])
    );
    const options: ts.CompilerOptions = {
      strict: true,
      noEmit: true,
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      skipLibCheck: true,
      types: [],
    };
    const host = ts.createCompilerHost(options);
    const { getSourceFile, fileExists, readFile } = host;
    host.fileExists = (f) => files.has(f) || fileExists.call(host, f);
    host.readFile = (f) => files.get(f) ?? readFile.call(host, f);
    host.getSourceFile = (f, lang, ...rest) => {
      const text = files.get(f);
      return text !== undefined
        ? ts.createSourceFile(f, text, lang)
        : getSourceFile.call(host, f, lang, ...rest);
    };
    const program = ts.createProgram([...files.keys()], options, host);
    cache = new Map(
      [...files.keys()].map((f, i) => [
        Object.keys(cases)[i],
        ts
          .getPreEmitDiagnostics(program, program.getSourceFile(f))
          .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')),
      ])
    );
    return cache;
  };
})();

const cases = {
  wrongLiteral: `
    match(input)
      .with({ type: 'gamma' }, () => 1)
      .otherwise(() => 0);`,
  twoWrongValues: `
    match(input)
      .with({ type: 'alpha', id: { value: true, items: 'gamma' } }, () => 1)
      .otherwise(() => 0);`,
  notAHandler: `
    match(input)
      .with(P.nonNullable, P.nullish)
      .otherwise(() => 0);`,
  wrongPrimitive: `
    match(n)
      .with('a', () => 1)
      .otherwise(() => 0);`,
  wrongLiteralInUnion: `
    match(lit)
      .with('c', () => 1)
      .otherwise(() => 0);`,
  wrongPrimitiveInObject: `
    match(input)
      .with({ type: 'beta', count: 'x' }, () => 1)
      .otherwise(() => 0);`,
  wrongArrayElement: `
    match(input)
      .with({ type: 'alpha', id: { items: [1] } }, () => 1)
      .otherwise(() => 0);`,
  wrongTupleElement: `
    match(tuple)
      .with(['a', 'b'], () => 1)
      .otherwise(() => 0);`,
  wrongOptionalProperty: `
    match(opt)
      .with({ name: 1 }, () => 1)
      .otherwise(() => 0);`,
  wrongUnionMember: `
    match(input)
      .with({ type: P.union('alpha', 'gamma') }, () => 1)
      .otherwise(() => 0);`,
};

const expected: Record<keyof typeof cases, string[]> = {
  wrongLiteral: [
    `Type '"gamma"' is not assignable to type 'Pattern<"alpha" | "beta"> | undefined'.`,
  ],
  twoWrongValues: [
    `Type 'true' is not assignable to type 'Pattern<number> | undefined'.`,
    `Type 'string' is not assignable to type 'Pattern<string[]> | undefined'.`,
  ],
  notAHandler: [
    `Argument of type 'NullishPattern' is not assignable to parameter of type '(selections: Input, value: Input) => unknown'.`,
  ],
  wrongPrimitive: [
    `Argument of type 'string' is not assignable to parameter of type 'Pattern<number>'.`,
  ],
  wrongLiteralInUnion: [
    `Argument of type '"c"' is not assignable to parameter of type 'Pattern<"a" | "b">'.`,
  ],
  wrongPrimitiveInObject: [
    `Type 'string' is not assignable to type 'Pattern<number> | undefined'.`,
  ],
  wrongArrayElement: [
    `Type '[number]' is not assignable to type 'Pattern<string[]> | undefined'.`,
  ],
  wrongTupleElement: [
    `Type 'string' is not assignable to type 'Pattern<number>'.`,
  ],
  wrongOptionalProperty: [
    `Type 'number' is not assignable to type 'Pattern<string | undefined>'.`,
  ],
  wrongUnionMember: [
    `Argument of type '"gamma"' is not assignable to parameter of type 'Pattern<"alpha" | "beta">'.`,
  ],
};

// Types that only exist in ts-pattern's implementation. (`PatternMatcher`
// can show up when TypeScript lists the members of a `Pattern` union.)
const internals = ['KnownPattern', 'InvalidPattern', '& void'];

describe('type error messages on invalid patterns', () => {
  for (const name of Object.keys(cases) as (keyof typeof cases)[]) {
    it(name, () => {
      const errors = getErrors(cases).get(name)!;
      expect(errors.length).toBeGreaterThan(0);
      const text = errors.join('\n');
      for (const line of expected[name]) {
        expect(text).toContain(line);
      }
      for (const internal of internals) {
        expect(text).not.toContain(internal);
      }
    });
  }
});
