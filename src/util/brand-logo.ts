import axios from 'axios';
import { Str } from './str';
import { SvgRenderer } from './svg-renderer';
import { BrandLogoResult } from '../types/brand-logo.types';

export class BrandLogo {
    public static readonly FILE_NAME = 'merk.png';

    private static readonly BASE_URL = 'https://www.kentekencheck.nl/assets/img/brands';
    private static readonly TIMEOUT_MS = 2500;
    // Matches the resolution of the remote logos, so the fallback survives being
    // drawn into the plate card just as well.
    private static readonly SIZE = 256;

    // The bytes are needed, not just a url: the logo is drawn into the plate card
    // as an embedded image. Only png is accepted, because that is what
    // kentekencheck serves and what the renderer can embed without conversion.
    private static readonly CONTENT_TYPE = 'image/png';

    private static readonly cache = new Map<string, Buffer>();

    public static async resolve(brand: string): Promise<BrandLogoResult> {
        const key = Str.humanToSnakeCase(brand);

        const cached = this.cache.get(key);
        if (cached) {
            return { image: cached };
        }

        const downloaded = await this.download(this.url(brand));
        const image = downloaded ?? this.renderFallback(brand);
        this.cache.set(key, image);

        return { image };
    }

    public static url(brand: string): string {
        return `${this.BASE_URL}/${Str.humanToSnakeCase(brand)}.png`;
    }

    // kentekencheck does not 404 on a missing logo, it redirects to an HTML
    // "niet gevonden" page, so the response has to be checked before it is used.
    private static async download(url: string): Promise<Buffer | null> {
        try {
            const response = await axios.get<ArrayBuffer>(url, {
                responseType: 'arraybuffer',
                timeout: this.TIMEOUT_MS,
                maxRedirects: 0,
                validateStatus: function (status: number): boolean {
                    return status < 500;
                },
            });

            if (response.status !== 200) {
                return null;
            }

            const contentType = String(response.headers['content-type'] ?? '')
                .split(';')[0]
                .trim();

            if (contentType !== this.CONTENT_TYPE) {
                return null;
            }

            return Buffer.from(response.data);
        } catch {
            return null;
        }
    }

    private static renderFallback(brand: string): Buffer {
        const initial = SvgRenderer.escape(this.initial(brand));
        const size = this.SIZE;
        const center = size / 2;

        const stroke = size / 32;

        const svg = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
            `<circle cx="${center}" cy="${center}" r="${
                center - stroke
            }" fill="#2B2D31" stroke="#4E5058" stroke-width="${stroke}"/>`,
            `<text x="${center}" y="${center + size / 6}" font-family="${SvgRenderer.TEXT_FONT_FAMILY}" font-size="${
                size / 2
            }" font-weight="bold" text-anchor="middle" fill="#B5BAC1">${initial}</text>`,
            '</svg>',
        ].join('');

        return SvgRenderer.toPng(svg);
    }

    private static initial(brand: string): string {
        const trimmed = brand.trim();

        return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
    }
}
