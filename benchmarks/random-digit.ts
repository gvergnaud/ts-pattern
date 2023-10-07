import { add, complete, cycle, suite } from 'benny';
import { match } from '../src';

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const testExhaustive = (digit: Digit) => {
  return match(digit)
    .with(0, () => 'zero')
    .with(1, () => 'one')
    .with(2, () => 'two')
    .with(3, () => 'three')
    .with(4, () => 'four')
    .with(5, () => 'five')
    .with(6, () => 'six')
    .with(7, () => 'seven')
    .with(8, () => 'eight')
    .with(9, () => 'nine')
    .exhaustive();
};

const testOtherwise = (digit: Digit) => {
  return match(digit)
    .with(0, () => 'zero')
    .with(1, () => 'one')
    .with(2, () => 'two')
    .with(3, () => 'three')
    .with(4, () => 'four')
    .with(5, () => 'five')
    .with(6, () => 'six')
    .with(7, () => 'seven')
    .with(8, () => 'eight')
    .with(9, () => 'nine')
    .otherwise(() => '');
};

const testIfElse = (digit: Digit) => {
  if (digit === 0) {
    return 'zero';
  } else if (digit === 1) {
    return 'one';
  } else if (digit === 2) {
    return 'two';
  } else if (digit === 3) {
    return 'three';
  } else if (digit === 4) {
    return 'four';
  } else if (digit === 5) {
    return 'five';
  } else if (digit === 6) {
    return 'six';
  } else if (digit === 7) {
    return 'seven';
  } else if (digit === 8) {
    return 'eight';
  } else if (digit === 9) {
    return 'nine';
  } else {
    return '';
  }
};

const testSwitch = (digit: Digit) => {
  switch (digit) {
    case 0:
      return 'zero';
    case 1:
      return 'one';
    case 2:
      return 'two';
    case 3:
      return 'three';
    case 4:
      return 'four';
    case 5:
      return 'five';
    case 6:
      return 'six';
    case 7:
      return 'seven';
    case 8:
      return 'eight';
    case 9:
      return 'nine';
    default:
      return '';
  }
};

const testTernary = (digit: Digit) => {
  return digit === 0
    ? 'zero'
    : digit === 1
    ? 'one'
    : digit === 2
    ? 'two'
    : digit === 3
    ? 'three'
    : digit === 4
    ? 'four'
    : digit === 5
    ? 'five'
    : digit === 6
    ? 'six'
    : digit === 7
    ? 'seven'
    : digit === 8
    ? 'eight'
    : digit === 9
    ? 'nine'
    : '';
};

const rand = () => Math.floor(Math.random() * 10) as Digit;

suite(
  'ts-pattern-benchmark',
  add('.exhaustive()', () => testExhaustive(rand())),
  add('.otherwise()', () => testOtherwise(rand())),
  add('if/else', () => testIfElse(rand())),
  add('switch', () => testSwitch(rand())),
  add('ternary', () => testTernary(rand())),
  cycle(),
  complete()
);
