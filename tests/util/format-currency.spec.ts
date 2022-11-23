import { formatCurrency } from '../../src/util/format-currency';

describe('Format currency helper', () => {
    it('should a number to a string representing prices in euros', () => {
        expect(formatCurrency(1100)).toBe('€ 1.100');
    });
});
