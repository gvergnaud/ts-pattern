import { Pattern } from './types/Pattern';
import { GuardValue } from './types/helpers';
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
 * [Read `match` documentation on GitHub](https://github.com/gvergnaud/ts-pattern#match)
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
export const match = <input, output = symbols.unset>(
  value: input
): Match<input, output> => new MatchExpression(value, []) as any;

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
    private value: i,
    private cases: {
      match: (value: i) => { matched: boolean; value: any };
      handler: (...args: any) => any;
    }[]
  ) {}

  with(...args: any[]) {
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

    return new MatchExpression(
      this.value,
      this.cases.concat([
        {
          match: (value: i) => {
            let selected: Record<string, unknown> = {};
            const matched = Boolean(
              patterns.some((pattern) =>
                matchPattern(pattern, value, (key, value) => {
                  selected[key] = value;
                })
              ) && predicates.every((predicate) => predicate(value as any))
            );
            return {
              matched,
              value:
                matched && Object.keys(selected).length
                  ? symbols.anonymousSelectKey in selected
                    ? selected[symbols.anonymousSelectKey]
                    : selected
                  : value,
            };
          },
          handler,
        },
      ])
    );
  }

  when<p extends (value: i) => unknown, c>(
    predicate: p,
    handler: (value: GuardValue<p>) => PickReturnValue<o, c>
  ) {
    return new MatchExpression<i, PickReturnValue<o, c>>(
      this.value,
      this.cases.concat([
        {
          match: (value) => ({
            matched: Boolean(predicate(value)),
            value,
          }),
          handler,
        },
      ])
    );
  }

  otherwise<c>(
    handler: (value: i) => PickReturnValue<o, c>
  ): PickReturnValue<o, c> {
    return new MatchExpression<i, PickReturnValue<o, c>>(
      this.value,
      this.cases.concat([
        {
          match: (value) => ({
            matched: true,
            value,
          }),
          handler,
        },
      ])
    ).run();
  }

  exhaustive() {
    return this.run();
  }

  run() {
    let selected = this.value;
    let handler: undefined | ((...args: any) => any) = undefined;

    for (let i = 0; i < this.cases.length; i++) {
      const entry = this.cases[i];
      const matchResult = entry.match(this.value);
      if (matchResult.matched) {
        selected = matchResult.value;
        handler = entry.handler;
        break;
      }
    }
    if (!handler) {
      let displayedValue;
      try {
        displayedValue = JSON.stringify(this.value);
      } catch (e) {
        displayedValue = this.value;
      }
      throw new Error(
        `Pattern matching error: no pattern matches value ${displayedValue}`
      );
    }
    return handler(selected, this.value);
  }
}
