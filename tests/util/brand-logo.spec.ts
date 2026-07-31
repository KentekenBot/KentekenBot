import axios from 'axios';
import { BrandLogo } from '../../src/util/brand-logo';

jest.mock('axios');

const mockedHead = axios.head as jest.MockedFunction<typeof axios.head>;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function response(status: number, contentType: string) {
    return { status, headers: { 'content-type': contentType } };
}

describe('BrandLogo.url', () => {
    it('snake cases the brand into the remote url', () => {
        expect(BrandLogo.url('ALFA ROMEO')).toBe('https://www.kentekencheck.nl/assets/img/brands/alfa_romeo.png');
    });
});

describe('BrandLogo.resolve', () => {
    beforeEach(() => {
        mockedHead.mockReset();
    });

    it('uses the remote url when it serves an image', async () => {
        mockedHead.mockResolvedValue(response(200, 'image/png'));

        const logo = await BrandLogo.resolve('Opel');

        expect(logo.url).toBe('https://www.kentekencheck.nl/assets/img/brands/opel.png');
        expect(logo.attachment).toBeNull();
    });

    it('falls back when the logo redirects to the not-found page', async () => {
        mockedHead.mockResolvedValue(response(302, 'text/html; charset=UTF-8'));

        const logo = await BrandLogo.resolve('Lynk & Co');

        expect(logo.url).toBe('attachment://merk-onbekend.png');
        expect(logo.attachment?.subarray(0, 8)).toEqual(PNG_MAGIC);
    });

    it('falls back when the request fails', async () => {
        mockedHead.mockRejectedValue(new Error('timeout'));

        const logo = await BrandLogo.resolve('Kaputt Motors');

        expect(logo.url).toBe('attachment://merk-onbekend.png');
        expect(logo.attachment?.subarray(0, 8)).toEqual(PNG_MAGIC);
    });

    it('caches the availability check per brand', async () => {
        mockedHead.mockResolvedValue(response(200, 'image/png'));

        await BrandLogo.resolve('Volvo');
        await BrandLogo.resolve('Volvo');

        expect(mockedHead).toHaveBeenCalledTimes(1);
    });
});
