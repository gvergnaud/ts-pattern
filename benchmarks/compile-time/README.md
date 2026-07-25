# Compile-time benchmarks

These files measure how expensive ts-pattern's types are for the
TypeScript compiler, as opposed to the runtime benchmarks in the parent
directory. They intentionally contain large `match` expressions of the
shapes that show up in real codebases:

- `large-union-exhaustive.ts`: a 200-member string literal union (the
  same shape as a large string enum), matched member by member.
- `discriminated-union-exhaustive.ts`: a 20-variant discriminated union
  of wide object types, matched per-discriminant with refined, 2-pattern
  and variadic `.with()` calls.
- The `-non-exhaustive` variants have one case removed, which simulates
  the mid-edit state your editor type-checks while you're still writing
  the match. The missing case is reported by `.exhaustive()` and
  silenced with `@ts-expect-error` so the project still type-checks.

Run all of them:

```sh
npm run perf:compile-time
```

Or measure a single file, which is more informative:

```sh
npx tsc --noEmit --strict --skipLibCheck --extendedDiagnostics \
  benchmarks/compile-time/large-union-exhaustive.ts
```

The metric to watch is `Instantiations`: it's deterministic for a given
TypeScript version, unlike `Check time`. For finer-grained data, use
`--generateTrace` and `@typescript/analyze-trace` (see the `trace` and
`analyzeTrace` scripts in the root package.json).
