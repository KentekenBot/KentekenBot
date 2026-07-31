import * as path from 'path';
import { Resvg } from '@resvg/resvg-js';

export class SvgRenderer {
    public static readonly PLATE_FONT_FAMILY = 'Kenteken';
    public static readonly TEXT_FONT_FAMILY = 'DejaVu Sans Condensed';

    private static readonly PLATE_FONT_PATH = path.join(__dirname, '..', '..', 'assets', 'fonts', 'Kenteken.ttf');
    private static readonly TEXT_FONT_PATH = require.resolve('dejavu-fonts-ttf/ttf/DejaVuSansCondensed-Bold.ttf');

    public static toPng(svg: string, scale = 1): Buffer {
        const resvg = new Resvg(svg, {
            fitTo: { mode: 'zoom', value: scale },
            font: {
                loadSystemFonts: false,
                fontFiles: [this.PLATE_FONT_PATH, this.TEXT_FONT_PATH],
                defaultFontFamily: this.TEXT_FONT_FAMILY,
            },
        });

        return resvg.render().asPng();
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
