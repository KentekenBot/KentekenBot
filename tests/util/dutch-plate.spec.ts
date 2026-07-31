import { DutchPlate } from '../../src/util/dutch-plate';

describe('DutchPlate.buildFragment', () => {
    it('renders the plate markup with the license on it', () => {
        const plate = DutchPlate.buildFragment('X-897-PL');

        expect(plate.markup).toContain('X-897-PL');
        expect(plate.markup).not.toContain('<svg');
        expect(plate.height).toBeGreaterThan(0);
    });

    it('measures a wider plate for a longer license', () => {
        const short = DutchPlate.buildFragment('1-AB-12');
        const long = DutchPlate.buildFragment('XX-897-PL');

        expect(long.width).toBeGreaterThan(short.width);
        expect(long.height).toBe(short.height);
    });

    it('escapes the license instead of injecting it into the markup', () => {
        const plate = DutchPlate.buildFragment('<X>');

        expect(plate.markup).toContain('&lt;X&gt;');
    });
});
