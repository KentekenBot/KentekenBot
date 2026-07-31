import axios from 'axios';
import { Str } from './str';
import { SvgRenderer } from './svg-renderer';
import { BrandLogoResult } from '../types/brand-logo.types';

export class BrandLogo {
    public static readonly FALLBACK_FILE_NAME = 'merk-onbekend.png';

    private static readonly BASE_URL = 'https://www.kentekencheck.nl/assets/img/brands';
    private static readonly TIMEOUT_MS = 2500;
    private static readonly SIZE = 128;

    // kentekencheck does not 404 on a missing logo, it redirects to an HTML
    // "niet gevonden" page. Discord then renders a broken thumbnail, so the
    // response has to be checked before the url is handed over.
    private static readonly availability = new Map<string, boolean>();

    public static async resolve(brand: string): Promise<BrandLogoResult> {
        const url = this.url(brand);

        if (await this.isImage(url)) {
            return { url, attachment: null };
        }

        return {
            url: `attachment://${this.FALLBACK_FILE_NAME}`,
            attachment: this.renderFallback(brand),
        };
    }

    public static url(brand: string): string {
        return `${this.BASE_URL}/${Str.humanToSnakeCase(brand)}.png`;
    }

    private static async isImage(url: string): Promise<boolean> {
        const cached = this.availability.get(url);
        if (cached !== undefined) {
            return cached;
        }

        const available = await this.checkRemote(url);
        this.availability.set(url, available);

        return available;
    }

    private static async checkRemote(url: string): Promise<boolean> {
        try {
            const response = await axios.head(url, {
                timeout: this.TIMEOUT_MS,
                maxRedirects: 0,
                validateStatus: function (status: number): boolean {
                    return status < 500;
                },
            });

            const contentType = String(response.headers['content-type'] ?? '');

            return response.status === 200 && contentType.startsWith('image/');
        } catch {
            return false;
        }
    }

    private static renderFallback(brand: string): Buffer {
        const initial = SvgRenderer.escape(this.initial(brand));
        const size = this.SIZE;
        const center = size / 2;

        const svg = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
            `<circle cx="${center}" cy="${center}" r="${
                center - 4
            }" fill="#2B2D31" stroke="#4E5058" stroke-width="4"/>`,
            `<text x="${center}" y="${center + 22}" font-family="${
                SvgRenderer.TEXT_FONT_FAMILY
            }" font-size="64" font-weight="bold" text-anchor="middle" fill="#B5BAC1">${initial}</text>`,
            '</svg>',
        ].join('');

        return SvgRenderer.toPng(svg);
    }

    private static initial(brand: string): string {
        const trimmed = brand.trim();

        return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
    }
}
