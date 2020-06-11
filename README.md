# TS Pattern

A complete Pattern Matching library for [TypeScript](https://github.com/microsoft/TypeScript)
with smart type inference.

```tsx
import { match } from 'ts-pattern';

type Data =
  | { type: 'text'; content: string }
  | { type: 'img'; src: string }
  | ...; // Imagine this union is huge!

type Result =
  | { type: 'ok'; data: Data }
  | { type: 'error'; error: Error };

let result: Result;

return match(result)
  .with({ type: 'ok', data: { type: 'text' } }, (res) => <p>{res.data.content}</p>)
  .with({ type: 'ok', data: { type: 'img' } }, (res) => <img src={res.data.src} />)
  .with({ type: 'error' }, (res) => <p>Oups! An error occured</p>)
  .otherwise(() => <p>everything else</p>);
```

## Features

- Supports **every data structure** you use: objects, arrays, tuples, Sets, Maps, and all primitive types.
- **Typesafe**, with great type inference.
- Supports catch all (`__`) and type specific **wildcards**.
- Supports `when(<predicate>)` and `not(<pattern>)` patterns for complexe cases.
- Supports properties selection, via the `select(<name>)` function.
- Tiny bundle footprint (**only 1kb**).

## What is Pattern Matching?

Pattern Matching is a technique coming from Functional Programming languages to declaratively write conditional code branches based on the structure of one or several values. This technique has proven itself to be much more powerful and much less verbose than imperative alternatives (if/else/switch statements) especially when branching on complex data structures or on several values.

Pattern Matching is implemented in Elixir, Rust, Haskell, Swift and many other languages. There is [a tc39 proposal](https://github.com/tc39/proposal-pattern-matching) to add Pattern Matching to the EcmaScript specification, but it is still in stage 1 and isn't likely to land before several years (if ever). Lukily, pattern matching can be implemented in userland. `ts-pattern` Provides a typesafe pattern matching implementation that you can start using today.

## Installation

Via npm:

```
npm install ts-pattern
```

Via yarn

```
yarn add ts-pattern
```

# Documentation

- [Code Sandbox Examples](#code-sandbox-examples)
- [Intro to key concepts](#intro-to-key-concepts)
- [API Reference](#api-reference)
  - [match](#match)
  - [.with](#with)
  - [.when](#when)
  - [.otherwise](#when)
  - [Patterns](#patterns)
    - [Literals](#literals)
    - [`__` wildcard](#__-wildcard)
    - [`__.string` wildcard](#__string-wildcard)
    - [`__.number` wildcard](#__number-wildcard)
    - [`__.boolean` wildcard](#__boolean-wildcard)
    - [Objects](#objects)
    - [Lists (arrays)](#lists-arrays)
    - [Tuples (arrays)](#tuples-arrays)
    - [Sets](#sets)
    - [Maps](#maps)
    - [`when` guards](#when-guards)
    - [`not` patterns](#not-patterns)
    - [`select` patterns](#select-patterns)
- [Type inference](#type-inference)
- [Inspirations](#inspirations)

## Code Sandbox Examples

- [Basic Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/basic.ts)
- [Reducer Demo (with React)](https://codesandbox.io/s/ts-pattern-reducer-example-c4yuq?file=/src/App.tsx)
- [Untyped Input (API response) Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/api.ts)
- [`when` Guard Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/when.ts)
- [`not` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/not.ts)
- [`select` Pattern Demo](https://codesandbox.io/s/ts-pattern-examples-0s6d8?file=/src/examples/not.ts)

## Intro to key concepts

Sometimes you want to match on two values at once. Let's say we want to
create a reducer function, we could make a switch on the event's type, but
generally an event only makes sense if we are in a certain state.

To avoid unwanted state changes that could lead to bugs, **we pattern match
on both the state and the event** and return a new state.

I use the word `event` but you can replace it with `action` if you are used
to Redux's terminology.

### Example: a state reducer with match

```ts
type State =
  | { status: 'idle' }
  | { status: 'loading'; startTime: number }
  | { status: 'success'; data: string }
  | { status: 'error'; error: Error };

type Event =
  | { type: 'fetch' }
  | { type: 'success'; data: string }
  | { type: 'error'; error: Error }
  | { type: 'cancel' };
```

```ts
import { match, __, not, select, when } from 'ts-pattern';

const reducer = (state: State, event: Event): State =>
  match<[State, Event], State>([state, event])
    .with([{ status: 'loading' }, { type: 'success' }], ([, event]) => ({
      status: 'success',
      data: event.data,
    }))

    .with(
      [{ status: 'loading' }, { type: 'error', error: select('err') }],
      (_, { err }) => ({
        status: 'error',
        error: err,
      })
    )

    .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
      status: 'loading',
      startTime: Date.now(),
    }))

    .with(
      [
        {
          status: 'loading',
          startTime: when((startTime) => Date.now() > startTime + 1000),
        },
        { type: 'cancel' },
      ],
      () => ({
        status: 'idle',
      })
    )

    .with(__, () => state)

    .run();
```

**Let's go through this bit by bit:**

### match(value)

`match` takes a value and returns a builder on which you can
add your pattern matching cases.

```ts
match<[State, Event], State>([state, event]);
```

Here we wrap the state and the event objects in an array and we explicitly
specify the type `[State, Event]` to make sure it is interpreted as
a [Tuple](#tuples-arrays) by TypeScript, so we
can match on each value separately.

Most of the time, you don't need to specify the type of input
and output with `match<Input, Output>(...)` because `match` is able to
infer both of this values.

### .with(pattern, handler)

Then we add a first `with` clause:

```ts
  .with([{ status: 'loading' }, { type: 'success' }], ([state, event]) => ({
    // `state` is infered as { status: 'loading' }
    // `event` is infered as { type: 'success', data: string }
    status: 'success',
    data: event.data,
  }))
```

The first argument is the **pattern**: the **shape of value**
you expect for this branch.

The second argument is the handler function: the **branch** that will be called if
the data matches the given pattern.

The **type** of the data structure is **narrowed down** to
what is permitted by the pattern.

### select(name)

In the second `with` clause, we use the `select` function:

```ts
  .with(
    [{ status: 'loading' }, { type: 'error', error: select('err') }],
    (_, { err }) => ({
      status: 'error',
      error: err,
    })
  )
```

It will inject the `event.error` property inside a `selections` object given as
second argument to the handler function. the `select` function takes the **name** of
the selection, which can be whatever you like.

It is pretty useful when pattern matching on deep data structures because it avoids
the hassle of destructuring it in your handler.

### not(pattern)

If you need to match on everything **but** a specific value, you can use
a `not(<pattern>)` pattern. it's a function taking a pattern
and returning its opposite:

```ts
  .with([{ status: not('loading') }, { type: 'fetch' }], () => ({
    status: 'loading',
  }))
```

### when(predicate)

The `when` function enables you to **add a guard** to your pattern.
Your pattern will not match **unless your predicate returns `true`**.
It might be handy if you need to make a dynamic checks on
your data structure.

```ts
  .with(
    [
      {
        status: 'loading',
        startTime: when((startTime) => Date.now() > startTime + 1000),
      },
      { type: 'cancel' },
    ],
    () => ({
      status: 'idle',
    })
  )
```

### the `__` wildcard

`__` will match any value.
You can use it at the top level, or inside your pattern.

```ts
  .with(__, () => state)

  // You could also use it inside your pattern:
  .with([__, __], () => state)

  // at any level:
  .with([__, { type: __ }], () => state)

```

### .run() and .otherwise()

```ts
  .run();
```

`run()` execute the pattern matching, and **returns the result**.

Alternatively you can use `otherwise`, which take an handler returning
a default value. `.otherwise(handler)` is equivalent to `.with(__, handler).run()`.

```ts
  .otherwise(() => state);
```

## API Reference

### .match

```ts
match(value);
```

Create a `Match` object on which you can later call `.with`, `.when`, `.otherwise` and `.run`.

#### Signature

```ts
function match<TInput, TOutput>(input: TInput): Match<TInput, TOutput>;
```

#### Options

- `input`
  - **Required**
  - the input value your patterns will be tested against.

### .with

```ts
match(...)
  .with(pattern, [, when, when, when], handler)
```

#### Signature

```ts
function with(
  pattern: Pattern<TInput>,
  [, when: (value: TInput) => unknown,
     when: (value: TInput) => unknown,
     when: (value: TInput) => unknown],
  handler: (value: TInput, selections?: Selections<TInput>) => TOutput
): Match<TInput, TOutput>;
```

#### Options

- `pattern: Pattern<TInput>`
  - **Required**
  - The pattern your input must match for the handler to be called.
  - [See all valid patterns bellow](#patterns)
- `when: (value: TInput) => unknown`
  - Optional
  - Additional condition the input must satisfy for the handler to be called.
  - You can add up to 3 when functions. The input will match if they all return truthy values.
  - `TInput` might be narrowed to a more precise type using the `pattern`.
- `handler: (value: TInput, selections: Selections<TInput>) => TOutput`
  - **Required**
  - Function called when the match conditions are satisfied.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.
  - `TInput` might be narrowed to a more precise type using the `pattern`.
  - `selections` is an object of properties selected from the input with the [`select` function](#select-patterns).

### .when

```ts
match(...)
  .when(predicate, handler)
```

#### Signature

```ts
function when(
  predicate: (value: TInput) => unknown,
  handler: (value: TInput) => TOutput
): Match<TInput, TOutput>;
```

#### Options

- `predicate: (value: TInput) => unknown`
  - **Required**
  - Condition the input must satisfy for the handler to be called.
- `handler: (value: TInput) => TOutput`
  - **Required**
  - Function called when the predicate condition is satisfied.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.

### .otherwise

```ts
match(...)
  .with(...)
  .otherwise(defaultHandler)
```

Executes the match case and return its result.

#### Signature

```ts
function otherwise(defaultHandler: () => TOutput): TOutput;
```

#### Options

- `defaultHandler: () => TOutput`
  - **Required**
  - Function called if no other patterns were matched.
  - Think of it as the `default:` case of `switch` statements.
  - All handlers on a single `match` case must return values of the same type, `TOutput`.

### .run

```ts
match(...)
  .with(...)
  .run()
```

Executes the match case and return its result.

#### Signature

```ts
function run(): TOutput;
```

### Patterns

Patterns are values matching one of the possible shapes of your input. They can
be literal values, data structures, wildcards, or special functions like `not`,
`when` and `select`.

If your input isn't typed, (if it's a `any` or a `unknown`), you have no constraints
on the shape of your pattern, you can put whatever you want. In your handler, your
value will take the type described by your pattern.

#### Literals

Literals are primitive javascript values, like number, string, boolean, bigint, null, undefined, and symbol.

```ts
import { match } from 'ts-pattern';

const input: unknown = 2;

const output = match(input)
  .with(2, () => 'number: two')
  .with(true, () => 'boolean: true')
  .with('hello', () => 'string: hello')
  .with(undefined, () => 'undefined')
  .with(null, () => 'null')
  .with(20n, () => 'bigint: 20n')
  .otherwise(() => 'something else');

console.log(output);
// => 'two'
```

#### `__` wildcard

The `__` pattern will match any value.

```ts
import { match, __ } from 'ts-pattern';

const input = 'hello';

const output = match(input)
  .with(__, () => 'It will always match')
  .otherwise(() => 'This string will never be used');

console.log(output);
// => 'It will always match'
```

#### `__.string` wildcard

The `__.string` pattern will match any value of type `string`.

```ts
import { match, __ } from 'ts-pattern';

const input = 'hello';

const output = match(input)
  .with('bonjour', () => 'Won‘t match')
  .with(__.string, () => 'it is a string!')
  .run();

console.log(output);
// => 'it is a string!'
```

#### `__.number` wildcard

The `__.number` pattern will match any value of type `number`.

```ts
import { match, __ } from 'ts-pattern';

const input = 2;

const output = match<number | string>(input)
  .with(__.string, () => 'it is a string!')
  .with(__.number, () => 'it is a number!')
  .run();

console.log(output);
// => 'it is a number!'
```

#### `__.boolean` wildcard

The `__.boolean` pattern will match any value of type `boolean`.

```ts
import { match, __ } from 'ts-pattern';

const input = true;

const output = match<number | string | boolean>(input)
  .with(__.string, () => 'it is a string!')
  .with(__.number, () => 'it is a number!')
  .with(__.boolean, () => 'it is a boolean!')
  .run();

console.log(output);
// => 'it is a boolean!'
```

#### Object

A pattern can be an object with sub-pattern properties. In order to match,
the input must be an object with all properties defined on the pattern object
and each property must match its sub-pattern.

```ts
import { match } from 'ts-pattern';

type Input =
  | { type: 'user'; name: string }
  | { type: 'image'; src: string }
  | { type: 'video'; seconds: number };

let input: Input = { type: 'user', name: 'Gabriel' };

const output = match(input)
  .with({ type: 'image' }, () => 'image')
  .with({ type: 'video', seconds: 10 }, () => 'video of 10 seconds.')
  .with({ type: 'user' }, ({ name }) => `user of name: ${name}`)
  .otherwise(() => 'something else');

console.log(output);
// => 'user of name: Gabriel'
```

#### Lists (arrays)

To match on a list of values, your pattern can be an array with a single sub-pattern in it.
This sub-pattern will be tested against all elements in your input array, and they
must all match for your list pattern to match.

```ts
import { match, __ } from 'ts-pattern';

type Input = { title: string; content: string }[];

let input: Input = [
  { title: 'Hello world!', content: 'I‘m a very interesting content' },
  { title: 'Bonjour!', content: 'I‘m a very interesting content too' },
];

const output = match(input)
  .with(
    [{ title: __.string, content: __.string }],
    (posts) => 'a list of posts!'
  )
  .otherwise(() => 'something else');

console.log(output);
// => 'a list of posts!'
```

#### Tuples (arrays)

In TypeScript, [Tuples](https://en.wikipedia.org/wiki/Tuple) are arrays with a fixed
number of elements which can be of different types. You can pattern match on tuples
with a tuple pattern matching your value in length and shape.

```ts
import { match, __ } from 'ts-pattern';

type Input =
  | [number, '+', number]
  | [number, '-', number]
  | [number, '*', number]
  | ['-', number];

const input: Input = [3, '*', 4];

const output = match<Input>(input)
  .with([__, '+', __], ([x, , y]) => x + y)
  .with([__, '-', __], ([x, , y]) => x - y)
  .with([__, '*', __], ([x, , y]) => x * y)
  .with(['-', __], ([, x]) => -x)
  .otherwise(() => NaN);

console.log(output);
// => 12
```

#### Sets

Similarly to array patterns, set patterns have a different meaning
if they contain a single sub-pattern or several of them:

```ts
import { match, __ } from 'ts-pattern';

type Input = Set<string | number>;

const input: Input = new Set([1, 2, 3]);

const output = match<Input>(input)
  .with(new Set([1, 'hello']), (set) => `Set contains 1 and 'hello'`)
  .with(new Set([1, 2]), (set) => `Set contains 1 and 2`)
  .with(new Set([__.string]), (set) => `Set contains only strings`)
  .with(new Set([__.number]), (set) => `Set contains only numbers`)
  .otherwise(() => '');

console.log(output);
// => 'Set contains 1 and 2'
```

If a Set pattern contains one single wildcard pattern, it will match if
each value in the input set match the wildcard.

If a Set pattern contains several values, it will match if the
input Set contains each of these values.

#### Maps

Map patterns are similar to object patterns. They match if each
keyed sub-pattern match the input value for the same key.

```ts
import { match, __ } from 'ts-pattern';

type Input = Map<string, string | number>;

const input: Input = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3],
]);

const output = match<Input>(input)
  .with(new Map([['b', 2]]), (map) => `map.get('b') is 2`)
  .with(new Map([['a', __.string]]), (map) => `map.get('a') is a string`)
  .with(
    new Map([
      ['a', __.number],
      ['c', __.number],
    ]),
    (map) => `map.get('a') and map.get('c') are number`
  )
  .otherwise(() => '');

console.log(output);
// => 'map.get('b') is 2'
```

#### `when` guards

the `when` function enables you to test the input with a custom guard function.
The pattern will match only if all `when` functions return a truthy value.

Note that you can narrow down the type of your input by providing a
[Type Guard function](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards) to when.

```ts
import { match, when } from 'ts-pattern';

type Input = { score: number };

const output = match<Input>({ score: 10 })
  .with(
    {
      score: when((score): score is 5 => score === 5),
    },
    (input) => 'Its a good 5/7.' // input is infered as { score: 5 }
  )
  .with({ score: when((score) => score < 5) }, () => 'bad')
  .with({ score: when((score) => score > 5) }, () => 'good')
  .run();

console.log(output);
// => 'good'
```

#### `not` patterns

The `not` function enables you to match on everything **but** a specific value.
it's a function taking a pattern and returning its opposite:

```ts
import { match, not } from 'ts-pattern';

type Input = boolean | number;

const toNumber = (input: Input) =>
  match(input)
    .with(not(__.boolean), (n) => n) // n: number
    .with(true, () => 1)
    .with(false, () => 0)
    .run();

console.log(toNumber(2));
// => 2
console.log(toNumber(true));
// => 1
```

#### `select` patterns

The `select` function enables you to pick a part of your data structure
and inject it in the `selections` object given as second parameter to
your handler function.

It can be useful when you have a deep data structure and you want to
avoid the hassle of destructuring it.

```ts
import { match, not } from 'ts-pattern';

type Input =
  | { type: 'post'; user: { name: string } }
  | { ... };

const input = { type: 'post', user: { name: 'Gabriel' } }

const output = match<Input>(input)
    .with(
      { type: 'post', user: { name: select('username') } },
      (_, { username }) => username // username: string
    )
    .otherwise(() => 'anonymous');

console.log(output);
// => 'Gabriel'
```

### type inference

`ts-pattern` strongly invests on typescript's type inference to narrow
the type of your value to something that match what you would expect.
Here are a few example:

```ts
type Input = { type: string } | string;

match<Input, 'ok'>({ type: 'hello' })
  .with(__, (value) => 'ok') // value: Input
  .with(__.string, (value) => 'ok') // value: string
  .with(
    when((value) => true),
    (value) => 'ok' // value: Input
  )
  .with(
    when((value): value is string => true),
    (value) => 'ok' // value: string
  )
  .with(not('hello'), (value) => 'ok') // value: Input
  .with(not(__.string), (value) => 'ok') // value: { type: string }
  .with(not({ type: __.string }), (value) => 'ok') // value: string
  .with(not(when(() => true)), (value) => 'ok') // value: Input
  .with({ type: __ }, (value) => 'ok') // value: { type: string }
  .with({ type: __.string }, (value) => 'ok') // value: { type: string }
  .with({ type: when(() => true) }, (value) => 'ok') // value: { type: string }
  .with({ type: not('hello' as 'hello') }, (value) => 'ok') // value: { type: string }
  .with({ type: not(__.string) }, (value) => 'ok') // value: never
  .with({ type: not(when(() => true)) }, (value) => 'ok') // value: { type: string }
  .run();
```

## Inspirations

This library has been heavily inspired by this great article by Wim Jongeneel:
[Pattern Matching in TypeScript with Record and Wildcard Patterns](https://medium.com/swlh/pattern-matching-in-typescript-with-record-and-wildcard-patterns-6097dd4e471d).
It made me realise pattern matching could be implemented in userland and we didn't have
to wait for it to be added to the language itself. I'm really grateful for that 🙏

#### how is this different from `typescript-pattern-matching`

Wim Jongeneel released his own npm package for pattern matching. `ts-pattern` has a few
notable differences:

- `ts-patterns`'s goal is to be a well unit-tested, well documented, production ready library.
- It supports more data structures, like tuples, sets and maps.
- It provides a "catch all" pattern: `__`.
- It supports deep selection with the `select()` function.
- Its type inference works on deeper patterns and is well tested.
