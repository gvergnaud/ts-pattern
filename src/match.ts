import { Pattern } from './types/Pattern';
import { Match, PickReturnValue } from './types/Match';
import * as symbols from './internals/symbols';
import { matchPattern } from './internals/helpers';

/**
 * `match` creates a **pattern matching expression**.
 *
 * Use `.with(pattern, handler)` to pattern match on the input.
 *
 * Use `.exhaustive()` or `.otherwise(() => defaultValue)` to end the expression and get the result.
 *
 * [Read the documentation for `match` on GitHub](https://github.com/gvergnaud/ts-pattern#match)
 *
 * @example
 *  declare let input: "A" | "B";
 *
 *  return match(input)
 *    .with("A", () => "It's a A!")
 *    .with("B", () => "It's a B!")
 *    .exhaustive();
 *
 */
export function match<const input, output = symbols.unset>(
  value: input
): Match<input, output> {
  return new MatchExpression(value) as any;
}

type MatchState<output> = { matched: true; value: output } | { matched: false };

const defaultMatchState: MatchState<never> = { matched: false };

/**
 * This class represents a match expression. It follows the
 * builder pattern, we chain methods to add features to the expression
 * until we call `.exhaustive`, `.otherwise` or the unsafe `.run`
 * method to execute it.
 *
 * The types of this class aren't public, the public type definition
 * can be found in src/types/Match.ts.
 */
class MatchExpression<i, o> {
  constructor(
    private input: i,
    private state: MatchState<o> = defaultMatchState
  ) {}

  with(...args: any[]): MatchExpression<i, any> {
    if (this.state.matched) return this;

    const handler = args[args.length - 1];

    const patterns: Pattern<i>[] = [args[0]];
    const predicates: ((value: i) => unknown)[] = [];

    // case with guard as second argument
    if (args.length === 3 && typeof args[1] === 'function') {
      patterns.push(args[0]);
      predicates.push(args[1]);
    } else if (args.length > 2) {
      // case with several patterns
      patterns.push(...args.slice(1, args.length - 1));
    }

    let selected: Record<string, unknown> = {};

    const matched = Boolean(
      patterns.some((pattern) =>
        matchPattern(pattern, this.input, (key, value) => {
          selected[key] = value;
        })
      ) && predicates.every((predicate) => predicate(this.input as any))
    );

    const state = matched
      ? {
          matched: true as const,
          value: handler(
            Object.keys(selected).length
              ? symbols.anonymousSelectKey in selected
                ? selected[symbols.anonymousSelectKey]
                : selected
              : this.input,
            this.input
          ),
        }
      : { matched: false as const };

    return new MatchExpression(this.input, state);
  }

  when<p extends (value: i) => unknown, c>(
    predicate: p,
    handler: (value: i, value2: i) => PickReturnValue<o, c>
  ): MatchExpression<i, any> {
    if (this.state.matched) return this;

    const matched = Boolean(predicate(this.input));

    return new MatchExpression<i, PickReturnValue<o, c>>(
      this.input,
      matched
        ? { matched: true, value: handler(this.input, this.input) }
        : { matched: false }
    );
  }

  otherwise<c>(handler: (value: i, value2: i) => PickReturnValue<o, c>): any {
    if (this.state.matched) return this.state.value;
    return handler(this.input, this.input);
  }

  exhaustive() {
    return this.run();
  }

  run() {
    if (this.state.matched) return this.state.value;

    let displayedValue;
    try {
      displayedValue = JSON.stringify(this.input);
    } catch (e) {
      displayedValue = this.input;
    }

    throw new Error(
      `Pattern matching error: no pattern matches value ${displayedValue}`
    );
  }

  returnType() {
    return this;
  }
}
