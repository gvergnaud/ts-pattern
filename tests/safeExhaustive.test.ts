import { match } from '../src';

type Input = 1 | 2;

describe('safeExhaustive', () => {
  let consoleSpy: ReturnType<
    ReturnType<(typeof jest)['spyOn']>['mockImplementation']
  >;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should not throw an error when exhaustiveness check fails', () => {
    const getAnswer = () =>
      match(3 as Input)
        .with(1, () => 1)
        .with(2, () => 2)
        .safeExhaustive(() => 3);

    expect(getAnswer).not.toThrowError();
  });

  it('should return the default value returned from the handler if no pattern matches', () => {
    const result = match(3 as Input)
      .with(1, () => 1)
      .with(2, () => 2)
      .safeExhaustive(() => 3);

    expect(result).toEqual(3);
  });

  it('should run console.error if no errorMessageHandler provided', () => {
    match(3 as Input)
      .with(1, () => 1)
      .with(2, () => 2)
      .safeExhaustive(() => 3);

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should run a custom handler if provided', () => {
    const handler = jest.fn();

    match(3 as Input)
      .with(1, () => 1)
      .with(2, () => 2)
      .safeExhaustive(() => 3, handler);

    expect(handler).toHaveBeenCalled();
  });
});
