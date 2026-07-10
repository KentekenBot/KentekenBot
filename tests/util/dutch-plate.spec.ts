import { DutchPlate } from '../../src/util/dutch-plate';

describe('DutchPlate.render', () => {
    it('renders a single bold row with blue NL strip and yellow plate', () => {
        const plate = DutchPlate.render('X-897-PL');

        expect(plate.startsWith('```ansi\n')).toBe(true);
        expect(plate.endsWith('\n```')).toBe(true);
        expect(plate).toContain('[1;37;44m NL ');
        expect(plate).toContain('[1;30;43m  X-897-PL  ');

        const rows = plate.split('\n').slice(1, -1);
        expect(rows).toHaveLength(1);
    });
});
