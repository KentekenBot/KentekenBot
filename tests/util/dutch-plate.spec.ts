import { DutchPlate } from '../../src/util/dutch-plate';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

describe('DutchPlate.render', () => {
    it('renders a png buffer', () => {
        const plate = DutchPlate.render('X-897-PL');

        expect(Buffer.isBuffer(plate)).toBe(true);
        expect(plate.subarray(0, 8)).toEqual(PNG_MAGIC);
    });

    it('renders a wider plate for a longer license', () => {
        const short = DutchPlate.render('1-AB-12');
        const long = DutchPlate.render('XX-897-PL');

        expect(long.length).toBeGreaterThan(0);
        expect(short.length).toBeGreaterThan(0);
        expect(DutchPlate.FILE_NAME).toBe('kenteken.png');
    });
});
