### Roadmap

- [ ] Find a way to enforce exhaustive pattern matching
- [ ] Maybe change the syntax for list, and provide a `__.list` pattern
- [ ] Forbid impossible patterns like `{ status: 'error', data: (data) => data.length > 3 }` (error have no data)
- [ ] General API rework

- Goal

  - API must be as concise as possible

- Several pattern/when closes if necessary, with refined type inference from one to the other

  - function `__.every(...patterns)` ?
    - benefit, can be used in a nested structure
    - drawbacks, introduce a new api keywork
  - use `which` arity : `.which(...patterns, handler)` ?
    - benefit, no api keyword, closer to pattern matching in haskell
    - drawbacks, cannot be applied to a subtree of the DS
  - Make selections composables with patterns

- Separate key concepts:
  - filtering patterns (values, `__`, `__.when`, `__.not`, `__.string`, ...)
  - argument selections patterns (`select.name('name', pattern?)`, `select.arg1(pattern?)`, `select.arg2(pattern?)`)

### Matching API

```ts
match<string | number | boolean>()
  // you can chain up to 5 patterns
  .with(
    __.number,
    __.when((x) => x > 2), // type of x is infered to be a number
    __.when((x) => x < 10),
    (x) => `${x} is between 2 and 10.`
  )
  .with(
    __.boolean,
    __.when((x) => x)
  )
  .with(
    { type: 'hello' },
    { data: __.when((data) => data.length > 2) },
    (x) => ``
  )
  // Remove when and withWhen
  .run();
```

Alternatively put the functions on match instead of on `__`

```ts
match<string | number | boolean>()
  .with(
    match.number,
    match.when((x) => x > 2),
    match.when((x) => x < 10),
    (x) => `${x} is between 2 and 10.`
  )
  .run();
```

Or on a new `pattern` var

```ts
match<string | number | boolean>()
  .with(
    pattern.number,
    pattern.when((x) => x > 2),
    pattern.when((x) => x < 10),
    (x) => `${x} is between 2 and 10.`
  )
  .with(pattern.any)
  .with(pattern.not(pattern.boolean), (x) => `x is not a boolean.`)
  .run();
```

Or a `P` var

```ts
match<string | number | boolean>()
  .with(
    P.number,
    P.when((x) => x > 2),
    P.when((x) => x < 10),
    (x) => `${x} is between 2 and 10.`
  )
  .with(P.any)
  .with(P.not(P.boolean), (x) => `x is not a boolean.`)
  .run();
```

### Selection API

```ts
match([state, event])
  .with(
    // No selection means we get the whole data structure by default
    [{ status: 'loading' }, { type: 'success' }],
    ([, { data }]) => ({ status: 'success', data })
  )
  .with(
    // If we select something, the signature of the handler changes
    // and the full datastructure is removed
    [{ status: 'loading' }, { type: 'success', data: select.arg1 }],
    (data) => ({ status: 'success', data })
  )
  .with(
    // You can mix a select with a pattern
    [{ status: 'loading' }, { type: 'success', data: select.arg1(__.string) }],
    (data) => ({ status: 'success', data })
  )
  // OR
  .with(
    // If we select something, the signature of the handler changes
    // but the full datastructure is still present
    [{ status: 'loading' }, { type: 'success', data: select.arg1() }],
    (_, data) => ({ status: 'success', data })
  )
  .with(
    // mixing named and unnamed selections
    [
      { status: 'success', data: select.named('oldData') },
      { type: 'success', data: select.arg1 },
    ],
    (_, data, { oldData }) => ({ status: 'success', data })
  )
  .run();
```

- [ ] Maybe rework the selection api to work with arg number?

```ts
const res = match<[State, Event], State>([state, event])
  .with(
    [{ status: 'loading' }, { type: 'success', data: __.arg1 }],
    (data) => ({ status: 'success', data })
  )
  .run();

// particularly nice compared to
const res = match<[State, Event], State>([state, event])
  .with(
    [{ status: 'loading' }, { type: 'success', data: select('data') }],
    (ds, { data }) => ({ status: 'success', data })
  )
  .run();
// or
const res = match<[State, Event], State>([state, event])
  .with([{ status: 'loading' }, { type: 'success', data }], ([, { data }]) => ({
    status: 'success',
    data,
  }))
  .run();
```

```ts
type Input = ['+', number, number] | ['*', number, number] | ['-', number];

const res = match<Input, number>(input)
  .with(['+', select.arg1, select.arg2], (x, y) => x + y)
  .run();

const res = match<Input, number>(input)
  .with(['+', __.arg1, __.arg2], (x, y) => x + y)
  .run();

// This could even be extend
const res = match<Input, number>(input)
  .with(['+', __.number.arg1, __.number.arg2], (x, y) => x + y)
  .run();

const res = match<Input, number>(input)
  .with(['+', arg1, arg2], (x, y) => x + y)
  .run();

const res = match<Input, number>(input)
  .with(['+', args.first, args.second, args.third], (x, y) => x + y)
  .run();
```

- [x] Find a way to make the full type inference work
- [x] Add an operator to select a part of the data structure

```ts
type Input = ['+', number, number] | ['*', number, number] | ['-', number];

const res = match<Input, number>(input).with(
  ['+', select('x'), select('y')],
  ({ x, y }) => x + y
);
```

- [x] Add `not(value)` in patterns.
  - this should have type like `{type: 'not', value: T }` which could be inverted to
    the least upper bound of between T and U.
  - it could also be implemented using a guard function
  - `{ value: n => n > m }`
- [x] Should we remove `run`, and use `otherwise` instead to run the computation ?
  - No because sometimes all patterns are handle without needing an otherwise
  - And it forces the user to create an extra returned value, which can be cumbersome
- [x] Narrow down to type of value in `when` if the predicate is a type guard.
  - Ask question about type guard inference on TS repo
