import { SvgRenderer } from './svg-renderer';
import { SvgFragment } from '../types/svg-fragment.types';

export class DutchPlate {
    private static readonly PLATE_FONT = SvgRenderer.PLATE_FONT_FAMILY;
    private static readonly STRIP_FONT = SvgRenderer.TEXT_FONT_FAMILY;

    private static readonly HEIGHT = 100;
    private static readonly STRIP_WIDTH = 62;
    private static readonly CORNER_RADIUS = 14;
    private static readonly SIDE_PADDING = 24;
    private static readonly FONT_SIZE = 66;

    // Advance widths in em, read from the Kenteken font. The face is proportional
    // (I is 0.384em, M is 0.884em), so the plate is measured rather than assuming
    // a fixed character width.
    private static readonly CAP_HEIGHT_EM = 0.875;
    private static readonly DEFAULT_ADVANCE_EM = 0.77;
    private static readonly ADVANCE_EM: Record<string, number> = {
        A: 0.858,
        B: 0.744,
        C: 0.709,
        D: 0.77,
        E: 0.7,
        F: 0.674,
        G: 0.753,
        H: 0.769,
        I: 0.384,
        J: 0.613,
        K: 0.76,
        L: 0.682,
        M: 0.884,
        N: 0.769,
        O: 0.77,
        P: 0.735,
        Q: 0.787,
        R: 0.759,
        S: 0.744,
        T: 0.7,
        U: 0.769,
        V: 0.763,
        W: 0.752,
        X: 0.757,
        Y: 0.732,
        Z: 0.716,
        '0': 0.77,
        '1': 0.454,
        '2': 0.709,
        '3': 0.674,
        '4': 0.753,
        '5': 0.753,
        '6': 0.753,
        '7': 0.691,
        '8': 0.745,
        '9': 0.753,
        '-': 0.385,
    };

    private static readonly PLATE_YELLOW = '#F2C500';
    private static readonly STRIP_BLUE = '#0B3B8C';
    private static readonly STAR_YELLOW = '#FFCC00';
    private static readonly TEXT_DARK = '#111111';

    public static buildFragment(formattedLicense: string): SvgFragment {
        const textWidth = this.textWidth(formattedLicense);
        const width = Math.round(this.STRIP_WIDTH + this.SIDE_PADDING * 2 + textWidth);
        const textCenter = this.STRIP_WIDTH + (width - this.STRIP_WIDTH) / 2;
        const baseline = (this.HEIGHT + this.CAP_HEIGHT_EM * this.FONT_SIZE) / 2;

        const markup = [
            `<rect width="${width}" height="${this.HEIGHT}" rx="${this.CORNER_RADIUS}" fill="${this.PLATE_YELLOW}"/>`,
            this.buildStrip(),
            this.buildStars(),
            `<text x="${this.STRIP_WIDTH / 2}" y="76" font-family="${
                this.STRIP_FONT
            }" font-size="26" font-weight="bold" text-anchor="middle" fill="#FFFFFF">NL</text>`,
            `<text x="${textCenter}" y="${baseline}" font-family="${this.PLATE_FONT}" font-size="${
                this.FONT_SIZE
            }" text-anchor="middle" fill="${this.TEXT_DARK}">${SvgRenderer.escape(formattedLicense)}</text>`,
        ].join('');

        return { markup, width, height: this.HEIGHT };
    }

    private static textWidth(formattedLicense: string): number {
        let em = 0;

        for (const character of formattedLicense.toUpperCase()) {
            em += this.ADVANCE_EM[character] ?? this.DEFAULT_ADVANCE_EM;
        }

        return em * this.FONT_SIZE;
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
}
