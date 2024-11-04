import { bench, describe, expect } from 'vitest';
import { match } from '../src';

type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

describe('ts-pattern-benchmark/always-last-digit', () => {

  bench('ts-pattern.exhaustive()', () => {
    const result = match(9 as Digit)
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
    expect(result).toBe('nine');
  });

  bench('ts-pattern.otherwise()', () => {
    const result = match(9 as Digit)
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
    expect(result).toBe('nine');
  });

  bench('if/else', () => {
    const digit = 9 as Digit;
    let result = '';
    if (digit === 0) {
      result = 'zero';
    } else if (digit === 1) {
      result = 'one';
    } else if (digit === 2) {
      result = 'two';
    } else if (digit === 3) {
      result = 'three';
    } else if (digit === 4) {
      result = 'four';
    } else if (digit === 5) {
      result = 'five';
    } else if (digit === 6) {
      result = 'six';
    } else if (digit === 7) {
      result = 'seven';
    } else if (digit === 8) {
      result = 'eight';
    } else if (digit === 9) {
      result = 'nine';
    }
    expect(result).toBe('nine');
  });

  bench('switch', () => {
    const digit = 9 as Digit;
    let result = '';
    switch (digit) {
      case 0:
        result = 'zero';
        break;
      case 1:
        result = 'one';
        break;
      case 2:
        result = 'two';
        break;
      case 3:
        result = 'three';
        break;
      case 4:
        result = 'four';
        break;
      case 5:
        result = 'five';
        break;
      case 6:
        result = 'six';
        break;
      case 7:
        result = 'seven';
        break;
      case 8:
        result = 'eight';
        break;
      case 9:
        result = 'nine';
        break;
    }
    expect(result).toBe('nine');
  });

  bench('ternary', () => {
    const digit = 9 as Digit;
    const result =
      digit === 0
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
    expect(result).toBe('nine');
  });
});
