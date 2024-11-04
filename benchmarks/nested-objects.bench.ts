import { bench, describe, expect } from 'vitest';
import { P, match } from '../src';

const map = {
  0: { type: 'a' as const, value: { x: Math.random(), y: Math.random() } },
  1: {
    type: 'b' as const,
    value: Math.random() > 0.5 ? [1, 2, 3, 4] : ['hello'],
  },
  2: { type: 'c' as const, age: Math.random(), name: 'acdfl' },
};
const rand = () => Math.floor(Math.random() * 3) as 0 | 1 | 2;

describe('ts-pattern-benchmark/nested-objects', () => {
  bench('ts-pattern.exhaustive()', () => {
    const inputIndex = rand();
    const input = map[inputIndex];
    const result = match(input)
      .with({ type: 'a', value: { x: P.number, y: P.number } }, () => 0)
      .with({ type: 'b', value: P.union([1, ...P.array(P.number)], ['hello']) }, () => 1)
      .with({ type: 'c', name: P.string, age: P.number }, () => 2)
      .otherwise(() => '4');
    expect(result).toBe(inputIndex);
  });

  bench('if/else', () => {
    const inputIndex = rand();
    const input = map[inputIndex];
    const result = (() => {
      if (
        input &&
        typeof input === 'object' &&
        'type' in input &&
        input.type === 'a' &&
        'value' in input &&
        input.value &&
        typeof input.value === 'object' &&
        'x' in input.value &&
        typeof input.value.x === 'number' &&
        'y' in input.value &&
        typeof input.value.y === 'number'
      ) {
        return 0;
      } else if (
        input &&
        typeof input === 'object' &&
        'type' in input &&
        input.type === 'b' &&
        'value' in input &&
        Array.isArray(input.value) && (
          (input.value[0] === 1 && input.value.slice(1).every((x) => typeof x === 'number')) ||
          (input.value[0] === "hello" && input.value.length === 1)
        )
      ) {
        return 1;
      } else if (
        input &&
        typeof input === 'object' &&
        'type' in input &&
        input.type === 'c' &&
        'name' in input &&
        typeof input.name === 'string' &&
        'age' in input &&
        typeof input.age === 'number'
      ) {
        return 2;
      } else {
        return 3;
      }
    })();
    expect(result).toBe(inputIndex);
  });
});
