import { Pattern } from './types/Pattern';
import { Match } from './types/Match';
import * as symbols from './internals/symbols';
import { matchPattern } from './internals/helpers';
import { NonExhaustiveError } from './errors';

type MatchState<output> =
  | { matched: true; value: output }
  | { matched: false; value: undefined };

const unmatched: MatchState<never> = {
  matched: false,
  value: undefined,
};

/**
 * `match` creates a **pattern matching expression**.
 *  * Use `.with(pattern, handler)` to pattern match on the input.
 *  * Use `.exhaustive()` or `.otherwise(() => defaultValue)` to end the expression and get the result.
 *
 * [Read the documentation for `match` on GitHub](https://github.com/gvergnaud/ts-pattern#match)
 *
 * @example
 *  declare let input: "A" | "B";
 *
 *  return match(input)
 *    .with("A", () => "It's an A!")
 *    .with("B", () => "It's a B!")
 *    .exhaustive();
 *
 */
export function match<const input, output = symbols.unset>(
  value: input
): Match<input, output> {
  return new MatchExpression(value, unmatched) as any;
}

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
  constructor(private input: input, private state: MatchState<output>) {}

  with(...args: any[]): MatchExpression<input, output> {
    if (this.state.matched) return this;

    const handler: (selection: unknown, value: input) => output =
      args[args.length - 1];

    const patterns: Pattern<input>[] = [args[0]];
    let predicate: ((value: input) => unknown) | undefined = undefined;

    if (args.length === 3 && typeof args[1] === 'function') {
      // case with guard as second argument
      predicate = args[1];
    } else if (args.length > 2) {
      // case with several patterns
      patterns.push(...args.slice(1, args.length - 1));
    }

    let hasSelections = false;
    let selected: Record<string, unknown> = {};
    const select = (key: string, value: unknown) => {
      hasSelections = true;
      selected[key] = value;
    };

    const matched =
      patterns.some((pattern) => matchPattern(pattern, this.input, select)) &&
      (predicate ? Boolean(predicate(this.input)) : true);

    const selections = hasSelections
      ? symbols.anonymousSelectKey in selected
        ? selected[symbols.anonymousSelectKey]
        : selected
      : this.input;

    const state = matched
      ? {
          matched: true as const,
          value: handler(selections, this.input),
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
    if (this.state.matched) return this.state.value;

    throw new NonExhaustiveError(this.input);
  }

  run(): output {
    return this.exhaustive();
  }

  returnType() {
    return this;
  }
}
