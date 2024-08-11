/**
 * Error when the given input value does not match any included pattern
 * and .exhaustive() was specified
 */
export class NonExhaustiveError extends Error {
  constructor(public input: unknown) {
    let displayedValue;
    try {
      displayedValue = JSON.stringify(input);
    } catch (e) {
      displayedValue = input;
    }
    super(`Pattern matching error: no pattern matches value ${displayedValue}`);
  }
}
