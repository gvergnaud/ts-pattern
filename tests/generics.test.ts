import { match } from '../src';

describe('generics', () => {
  it('should have basic support for data structures containing generics', () => {
    type State<T> =
      | { t: 'success'; value: T }
      | { t: 'error'; error: Error }
      | { t: 'loading' };

    const f = <T>(input: State<T>) =>
      match(input)
        .with({ t: 'success' }, (x, i) => {
          return 'success!';
        })
        .run();
  });
});
