import { DutchPlate } from '../../src/util/dutch-plate';

describe('DutchPlate.render', () => {
    it('renders the plate as an ansi block with blue NL strip and yellow plate', () => {
        const plate = DutchPlate.render('X-897-PL');

        expect(plate.startsWith('```ansi\n')).toBe(true);
        expect(plate.endsWith('\n```')).toBe(true);
        expect(plate).toContain('[1;37;44m NL ');
        expect(plate).toContain('[1;30;43m  X-897-PL  ');
    });

    it('pads the plate with matching-width blank rows above and below', () => {
        const plate = DutchPlate.render('X-897-PL');
        const rows = plate.split('\n').slice(1, -1);

        expect(rows).toHaveLength(3);
        expect(rows[0]).toBe(rows[2]);
        expect(rows[0]).toContain(' '.repeat('X-897-PL'.length + 4));
    });
});
