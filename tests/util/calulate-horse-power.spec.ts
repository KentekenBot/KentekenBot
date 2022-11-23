import { calculateHorsePower } from '../../src/util/calulate-horse-power';

describe('Calulate horse power', () => {
    it('should convert kw to hp', () => {
        expect(calculateHorsePower(100)).toBe(136);
        expect(calculateHorsePower(165)).toBe(225);
    });
});
