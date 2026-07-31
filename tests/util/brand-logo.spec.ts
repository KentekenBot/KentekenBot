import axios from 'axios';
import { BrandLogo } from '../../src/util/brand-logo';

jest.mock('axios');

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const REMOTE_PNG = Buffer.concat([PNG_MAGIC, Buffer.from('remote logo')]);

function response(status: number, contentType: string, body: Buffer = Buffer.alloc(0)) {
    return { status, headers: { 'content-type': contentType }, data: body };
}

describe('BrandLogo.url', () => {
    it('snake cases the brand into the remote url', () => {
        expect(BrandLogo.url('ALFA ROMEO')).toBe('https://www.kentekencheck.nl/assets/img/brands/alfa_romeo.png');
    });
});

describe('BrandLogo.resolve', () => {
    beforeEach(() => {
        mockedGet.mockReset();
    });

    it('uses the remote logo when it serves a png', async () => {
        mockedGet.mockResolvedValue(response(200, 'image/png', REMOTE_PNG));

        const logo = await BrandLogo.resolve('Opel');

        expect(logo.image).toEqual(REMOTE_PNG);
        expect(mockedGet).toHaveBeenCalledWith(
            'https://www.kentekencheck.nl/assets/img/brands/opel.png',
            expect.objectContaining({ responseType: 'arraybuffer' })
        );
    });

    it('falls back when the logo redirects to the not-found page', async () => {
        mockedGet.mockResolvedValue(response(302, 'text/html; charset=UTF-8'));

        const logo = await BrandLogo.resolve('Lynk & Co');

        expect(logo.image.subarray(0, 8)).toEqual(PNG_MAGIC);
        expect(logo.image).not.toEqual(REMOTE_PNG);
    });

    it('falls back when the response is not a png', async () => {
        mockedGet.mockResolvedValue(response(200, 'image/webp', Buffer.from('RIFF')));

        const logo = await BrandLogo.resolve('Webp Motors');

        expect(logo.image.subarray(0, 8)).toEqual(PNG_MAGIC);
    });

    it('falls back when the request fails', async () => {
        mockedGet.mockRejectedValue(new Error('timeout'));

        const logo = await BrandLogo.resolve('Kaputt Motors');

        expect(logo.image.subarray(0, 8)).toEqual(PNG_MAGIC);
    });

    it('caches the logo per brand', async () => {
        mockedGet.mockResolvedValue(response(200, 'image/png', REMOTE_PNG));

        await BrandLogo.resolve('Volvo');
        await BrandLogo.resolve('Volvo');

        expect(mockedGet).toHaveBeenCalledTimes(1);
    });
});
