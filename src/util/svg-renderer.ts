import * as path from 'path';
import { Resvg, ResvgRenderOptions } from '@resvg/resvg-js';

export class SvgRenderer {
    public static readonly PLATE_FONT_FAMILY = 'Kenteken';

    // The condensed bold face registers under its typographic family name, not the
    // name of the file: asking for "DejaVu Sans Condensed" matches nothing, and the
    // fallback silently lands on Kenteken, which renders lowercase as capitals with
    // an overline.
    public static readonly TEXT_FONT_FAMILY = 'DejaVu Sans';

    private static readonly PLATE_FONT_PATH = path.join(__dirname, '..', '..', 'assets', 'fonts', 'Kenteken.ttf');
    private static readonly TEXT_FONT_PATH = require.resolve('dejavu-fonts-ttf/ttf/DejaVuSansCondensed-Bold.ttf');

    // Room for any single line of text to be laid out before it is measured.
    private static readonly MEASURE_CANVAS = 8000;

    public static toPng(svg: string, scale = 1): Buffer {
        return new Resvg(svg, this.options(scale)).render().asPng();
    }

    // The width the text will actually occupy, read back from the font itself
    // instead of assumed, so a long brand or model can be fitted to the space it
    // has. This is the ink extent, which is a little narrower than the sum of the
    // advance widths: the side bearings of the first and last glyph fall outside.
    public static measureTextWidth(text: string, attributes: string): number {
        if (!text) {
            return 0;
        }

        const canvas = this.MEASURE_CANVAS;
        const svg = [
            `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas}" height="${canvas}">`,
            `<text x="0" y="${canvas / 2}" ${attributes}>${this.escape(text)}</text>`,
            '</svg>',
        ].join('');

        const bbox = new Resvg(svg, this.options()).getBBox();

        return bbox ? bbox.width : 0;
    }

    private static options(scale = 1): ResvgRenderOptions {
        return {
            fitTo: { mode: 'zoom', value: scale },
            font: {
                loadSystemFonts: false,
                fontFiles: [this.PLATE_FONT_PATH, this.TEXT_FONT_PATH],
                defaultFontFamily: this.TEXT_FONT_FAMILY,
            },
        };
    }

    public static escape(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}
