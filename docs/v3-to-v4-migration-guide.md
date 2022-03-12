# TS-Pattern v3 to v4 Migration Guide

## Breaking changes

### Imports

type-specific wildcard patterns have moved from `__.<pattern>` to a new qualified module named `P` exported by ts-pattern.
The catch-all wildcard `__` is still exported at the top level, but no longer has any properties.

```diff
- import { match, __ } from 'ts-pattern';
+ import { match, P, __ } from 'ts-pattern';


const toNumber = (value: string | number) =>
  match(value)
-   .with(__.string, (v) => v)
-   .with(__.number, (v) => `${v}`)
+   .with(P.string, (v) => v)
+   .with(P.number, (v) => `${v}`)
    .exhaustive();
```

### list patterns

The syntax for matching on a list of elements with an unknown length has changed from `[subpattern]` to `P.array(subpattern)`.

Example:

```diff
- import { match, __ } from 'ts-pattern';
+ import { match, P } from 'ts-pattern';


const parseUsers = (response: unknown) =>
  match(response)
-   .with({ data: [{ name: __.string }] }, (users) => users)
+   .with({ data: P.array({ name: P.string }) }, (users) => users)
    .otherwise(() => []);
```

Now `[subpattern]` matches arrays with 1 element in them. This is more consistent with native language features, like destructuring assignement and is overall more intuitive. This will resolve [#69](https://github.com/gvergnaud/ts-pattern/issues/69), [#62](https://github.com/gvergnaud/ts-pattern/issues/62) and [#46](https://github.com/gvergnaud/ts-pattern/issues/46).

### NaN

The `__.NaN` pattern has been replaced by simply using the NaN value in the pattern:

```diff
match<number>(NaN)
-   .with(__.NaN, () => "this is not a number")
+   .with(NaN, () => "this is not a number")
    .otherwise((n) => n);
```
