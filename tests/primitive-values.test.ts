import { match } from '../src';

describe('Primitive values', () => {
  it('patterns can be any primitive value', () => {
    const x = 2 as any;

    expect(
      match(x)
        .with(true, () => 'true')
        .with(false, () => 'false')
        .with(null, () => 'null')
        .with(undefined, () => 'undefined')
        .with(Symbol.for('Hello'), () => 'Symbol')
        .with('hello', () => 'hello')
        .with(1, () => '1')
        .with(2, () => '2')
        .otherwise(() => '?')
    ).toEqual('2');
  });
});
