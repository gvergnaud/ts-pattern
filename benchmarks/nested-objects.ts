import { add, complete, cycle, suite } from 'benny';
import { P, match } from '../src';

const testExhaustive = (input: unknown) => {
  return match(input)
    .with({ type: 'a', value: { x: P.number, y: P.number } }, () => '1')
    .with({ type: 'b', value: [1, ...P.array(P.number)] }, () => '2')
    .with({ type: 'c', name: P.string, age: P.number }, () => '3')
    .otherwise(() => '4');
};

const testIfElse = (input: unknown) => {
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
    return '1';
  } else if (
    input &&
    typeof input === 'object' &&
    'type' in input &&
    input.type === 'b' &&
    'value' in input &&
    Array.isArray(input.value) &&
    input.value[0] === 1 &&
    input.value.slice(1).every((x) => typeof x === 'number')
  ) {
    return '2';
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
    return '3';
  } else {
    return '4';
  }
};

const rand = () => {
  const map = {
    0: { type: 'a' as const, value: { x: Math.random(), y: Math.random() } },
    1: {
      type: 'b' as const,
      value: Math.random() > 0.5 ? [1, 2, 3, 4] : ['hello'],
    },
    2: { type: 'c' as const, age: Math.random(), name: 'acdfl' },
  };

  return map[Math.floor(Math.random() * 3) as 0 | 1 | 2];
};

suite(
  'ts-pattern-benchmark',
  add('.exhaustive()', () => testExhaustive(rand())),
  add('if/else', () => testIfElse(rand())),
  cycle(),
  complete()
);
