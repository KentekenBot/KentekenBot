import { DutchPlate } from '../../src/util/dutch-plate';

describe('DutchPlate.render', () => {
    it('renders the plate as an ansi block with blue NL strip and yellow plate', () => {
        const plate = DutchPlate.render('X-897-PL');

        expect(plate.startsWith('```ansi\n')).toBe(true);
        expect(plate.endsWith('\n```')).toBe(true);
        expect(plate).toContain('[0;37;44mNL');
        expect(plate).toContain('[0;30;43m X-897-PL ');
        expect(plate).toContain('[0m');
    });
});
