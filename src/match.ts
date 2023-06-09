import { Pattern } from './types/Pattern';
import { Match } from './types/Match';
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

type MatchState<output> =
  | { matched: true; value: output }
  | { matched: false; value: undefined };

const unmatched: MatchState<never> = {
  matched: false,
  value: undefined,
};

/**
 * This class represents a match expression. It follows the
 * builder pattern, we chain methods to add features to the expression
 * until we call `.exhaustive`, `.otherwise` or the unsafe `.run`
 * method to execute it.
 *
 * The types of this class aren't public, the public type definition
 * can be found in src/types/Match.ts.
 */
class MatchExpression<input, output> {
  constructor(
    private input: input,
    private state: MatchState<output> = unmatched
  ) {}

  with(...args: any[]): MatchExpression<input, output> {
    if (this.state.matched) return this;

    const handler: (selection: unknown, value: input) => output =
      args[args.length - 1];

    const patterns: Pattern<input>[] = [args[0]];
    const predicates: ((value: input) => unknown)[] = [];

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
      ) && predicates.every((predicate) => predicate(this.input))
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
      : unmatched;

    return new MatchExpression(this.input, state);
  }

  when(
    predicate: (value: input) => unknown,
    handler: (selection: input, value: input) => output
  ): MatchExpression<input, output> {
    if (this.state.matched) return this;

    const matched = Boolean(predicate(this.input));

    return new MatchExpression<input, output>(
      this.input,
      matched
        ? { matched: true, value: handler(this.input, this.input) }
        : unmatched
    );
  }

  otherwise(handler: (value: input) => output): output {
    if (this.state.matched) return this.state.value;
    return handler(this.input);
  }

  exhaustive(): output {
    return this.run();
  }

  run(): output {
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
