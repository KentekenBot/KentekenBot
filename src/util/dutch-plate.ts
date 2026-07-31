import { Resvg } from '@resvg/resvg-js';

export class DutchPlate {
    public static readonly FILE_NAME = 'kenteken.png';

    private static readonly FONT_FAMILY = 'DejaVu Sans Condensed';
    private static readonly FONT_PATH = require.resolve('dejavu-fonts-ttf/ttf/DejaVuSansCondensed-Bold.ttf');

    private static readonly HEIGHT = 100;
    private static readonly STRIP_WIDTH = 62;
    private static readonly CORNER_RADIUS = 14;
    private static readonly CHAR_WIDTH = 38;
    private static readonly SIDE_PADDING = 26;

    private static readonly PLATE_YELLOW = '#F2C500';
    private static readonly STRIP_BLUE = '#0B3B8C';
    private static readonly STAR_YELLOW = '#FFCC00';
    private static readonly TEXT_DARK = '#111111';

    public static render(formattedLicense: string): Buffer {
        const svg = this.buildSvg(formattedLicense);

        const resvg = new Resvg(svg, {
            font: {
                loadSystemFonts: false,
                fontFiles: [this.FONT_PATH],
                defaultFontFamily: this.FONT_FAMILY,
            },
        });

        return resvg.render().asPng();
    }

    private static buildSvg(formattedLicense: string): string {
        const textWidth = formattedLicense.length * this.CHAR_WIDTH;
        const width = this.STRIP_WIDTH + this.SIDE_PADDING * 2 + textWidth;
        const textCenter = this.STRIP_WIDTH + (width - this.STRIP_WIDTH) / 2;

        return [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${this.HEIGHT}" viewBox="0 0 ${width} ${this.HEIGHT}">`,
            `<rect width="${width}" height="${this.HEIGHT}" rx="${this.CORNER_RADIUS}" fill="${this.PLATE_YELLOW}"/>`,
            this.buildStrip(),
            this.buildStars(),
            `<text x="${this.STRIP_WIDTH / 2}" y="76" font-family="${
                this.FONT_FAMILY
            }" font-size="26" font-weight="bold" text-anchor="middle" fill="#FFFFFF">NL</text>`,
            `<text x="${textCenter}" y="74" font-family="${
                this.FONT_FAMILY
            }" font-size="58" font-weight="bold" letter-spacing="3" text-anchor="middle" fill="${
                this.TEXT_DARK
            }">${this.escape(formattedLicense)}</text>`,
            '</svg>',
        ].join('');
    }

    private static buildStrip(): string {
        const radius = this.CORNER_RADIUS;
        const height = this.HEIGHT;
        const width = this.STRIP_WIDTH;

        const path = [
            `M${radius} 0`,
            `H${width}`,
            `V${height}`,
            `H${radius}`,
            `A${radius} ${radius} 0 0 1 0 ${height - radius}`,
            `V${radius}`,
            `A${radius} ${radius} 0 0 1 ${radius} 0`,
            'Z',
        ].join(' ');

        return `<path d="${path}" fill="${this.STRIP_BLUE}"/>`;
    }

    private static buildStars(): string {
        const centerX = this.STRIP_WIDTH / 2;
        const centerY = 30;
        const radius = 10;

        const stars: string[] = [];
        for (let index = 0; index < 12; index++) {
            const angle = (index / 12) * 2 * Math.PI;
            const x = centerX + radius * Math.sin(angle);
            const y = centerY - radius * Math.cos(angle);
            stars.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.6"/>`);
        }

        return `<g fill="${this.STAR_YELLOW}">${stars.join('')}</g>`;
    }

    private static escape(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
