import { match, __ } from '../src';

describe('otherwise', () => {
    it('should pass matched value to otherwise', () => {
        const result = match(42)
            .with(51, d => d)
            .otherwise(d => d);
        expect(result).toBe(42);
    })
});