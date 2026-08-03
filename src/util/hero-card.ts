import { DutchPlate } from './dutch-plate';
import { SvgRenderer } from './svg-renderer';
import { SvgText } from './svg-text';
import { HeroCardData, HeroCardFact } from '../types/hero-card.types';

// One image carrying everything visual about the vehicle: the brand and model in
// type, the logo as a watermark bleeding off the right edge, the plate on its own
// baseline and the headline facts beside it.
//
// The card draws no frame of its own. Discord already wraps it in a rounded
// container with an accent bar down the left, and a second rounded edge or stripe
// inside the image reads as a rendering bug. What is left in message text is the
// caption, which is also the only part Discord can search.
export class HeroCard {
    public static readonly FILE_NAME_EXTENSION = 'png';

    // Rendered far above its display size: Discord scales a gallery item down to
    // the width of the reply, so anything sized for the layout is upscaled again on
    // a high dpi screen.
    private static readonly WIDTH = 1800;
    private static readonly HEIGHT = 600;

    private static readonly PAD_X = 108;
    private static readonly PAD_TOP = 96;
    private static readonly PAD_BOTTOM = 84;

    private static readonly CAP_HEIGHT_EM = 0.73;

    private static readonly EYEBROW_SIZE = 30;
    private static readonly EYEBROW_TRACKING = 6.6;

    private static readonly MODEL_SIZE = 96;
    private static readonly MODEL_MIN_SIZE = 46;
    private static readonly MODEL_MAX_WIDTH = 1010;
    private static readonly MODEL_CAP_TOP = 162;

    private static readonly PLATE_WIDTH = 612;

    private static readonly FACT_LABEL_SIZE = 30;
    private static readonly FACT_LABEL_TRACKING = 2.2;
    private static readonly FACT_VALUE_SIZE = 40;
    private static readonly FACT_GAP = 56;

    // A swing tag hung off the right edge of the plate: a pointed left end, a punched
    // hole and a string back to the plate.
    private static readonly TAG_SIZE = 34;
    private static readonly TAG_TRACKING = 4.4;
    private static readonly TAG_PAD_X = 34;
    private static readonly TAG_HEIGHT = 64;

    private static readonly LOGO_SIZE = 700;
    private static readonly LOGO_BLEED = 90;
    private static readonly LOGO_OPACITY = 0.16;

    private static readonly ACCENT = '#F2C500';
    private static readonly INK = '#FFFFFF';
    private static readonly INK_DIM = '#8B929F';
    // Read against the accent fill of the tag, not against the panel.
    private static readonly INK_INVERTED = '#12141A';

    public static render(data: HeroCardData): Buffer {
        const svg = [
            `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${this.WIDTH}" height="${this.HEIGHT}" viewBox="0 0 ${this.WIDTH} ${this.HEIGHT}">`,
            this.buildDefinitions(),
            `<rect width="${this.WIDTH}" height="${this.HEIGHT}" fill="url(#ground)"/>`,
            this.buildWatermark(data.logo),
            this.buildTitle(data.brand, data.model),
            this.buildTag(data.tag),
            this.buildPlate(data.formattedLicense),
            this.buildFacts(data.facts),
            '</svg>',
        ].join('');

        return SvgRenderer.toPng(svg);
    }

    // The logo is desaturated and lifted before it is faded, otherwise a dark brand
    // mark disappears into the panel instead of ghosting over it.
    private static buildDefinitions(): string {
        return [
            '<defs>',
            '<linearGradient id="ground" x1="0" y1="0" x2="1" y2="0.55">',
            '<stop offset="0" stop-color="#0D0F13"/>',
            '<stop offset="0.58" stop-color="#171A20"/>',
            '<stop offset="1" stop-color="#1D2129"/>',
            '</linearGradient>',
            '<filter id="ghost">',
            '<feColorMatrix type="saturate" values="0"/>',
            '<feComponentTransfer>',
            '<feFuncR type="linear" slope="2.4"/>',
            '<feFuncG type="linear" slope="2.4"/>',
            '<feFuncB type="linear" slope="2.4"/>',
            '</feComponentTransfer>',
            '</filter>',
            '</defs>',
        ].join('');
    }

    private static buildWatermark(logo: Buffer): string {
        const x = this.WIDTH + this.LOGO_BLEED - this.LOGO_SIZE;
        const y = (this.HEIGHT - this.LOGO_SIZE) / 2;

        return `<image x="${x}" y="${y}" width="${this.LOGO_SIZE}" height="${this.LOGO_SIZE}" opacity="${
            this.LOGO_OPACITY
        }" filter="url(#ghost)" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/png;base64,${logo.toString(
            'base64'
        )}"/>`;
    }

    private static buildTitle(brand: string, model: string): string {
        const eyebrow = brand.trim().toUpperCase();
        const heading = model.trim() || brand.trim();

        const parts: string[] = [];

        if (eyebrow && model.trim()) {
            const baseline = this.PAD_TOP + this.EYEBROW_SIZE * this.CAP_HEIGHT_EM;
            parts.push(
                `<text x="${this.PAD_X}" y="${baseline}" ${SvgText.bold(
                    this.EYEBROW_SIZE,
                    this.EYEBROW_TRACKING
                )} fill="${this.ACCENT}">${SvgRenderer.escape(eyebrow)}</text>`
            );
        }

        if (heading) {
            const fitted = this.fitHeading(heading);
            const baseline = this.MODEL_CAP_TOP + fitted.size * this.CAP_HEIGHT_EM;
            parts.push(
                `<text x="${this.PAD_X}" y="${baseline}" ${SvgText.bold(fitted.size)} fill="${
                    this.INK
                }">${SvgRenderer.escape(fitted.text)}</text>`
            );
        }

        return parts.join('');
    }

    // Long model names are shrunk to fit, and only truncated once shrinking alone
    // would make them unreadable.
    private static fitHeading(heading: string): { text: string; size: number } {
        const width = this.headingWidth(heading, this.MODEL_SIZE);

        if (width <= this.MODEL_MAX_WIDTH) {
            return { text: heading, size: this.MODEL_SIZE };
        }

        const scaled = Math.floor((this.MODEL_SIZE * this.MODEL_MAX_WIDTH) / width);
        if (scaled >= this.MODEL_MIN_SIZE) {
            return { text: heading, size: scaled };
        }

        let text = heading;
        while (text.length > 1 && this.headingWidth(`${text}…`, this.MODEL_MIN_SIZE) > this.MODEL_MAX_WIDTH) {
            text = text.slice(0, -1).trimEnd();
        }

        return { text: `${text}…`, size: this.MODEL_MIN_SIZE };
    }

    private static headingWidth(heading: string, size: number): number {
        return SvgText.boldWidth(heading, size);
    }

    // A filled pill in the top right corner, the one part of the canvas the title, the
    // plate and the facts all leave empty. Drawn after the watermark so it sits on top
    // of the logo rather than under it.
    private static buildTag(tag: string | null): string {
        const label = (tag ?? '').trim().toUpperCase();
        if (!label) {
            return '';
        }

        const attributes = SvgText.bold(this.TAG_SIZE, this.TAG_TRACKING);
        const width = SvgText.boldWidth(label, this.TAG_SIZE, this.TAG_TRACKING) + this.TAG_PAD_X * 2;

        const x = this.WIDTH - this.PAD_X - width;

        // Centred on the eyebrow's cap height, so the tag and the brand read as one line.
        const middle = this.PAD_TOP + (this.EYEBROW_SIZE * this.CAP_HEIGHT_EM) / 2;
        const top = middle - this.TAG_HEIGHT / 2;
        const baseline = middle + (this.TAG_SIZE * this.CAP_HEIGHT_EM) / 2;

        return [
            `<rect x="${x}" y="${top}" width="${width}" height="${this.TAG_HEIGHT}" rx="${this.TAG_HEIGHT / 2}" fill="${
                this.ACCENT
            }"/>`,
            `<text x="${x + this.TAG_PAD_X}" y="${baseline}" ${attributes} fill="${
                this.INK_INVERTED
            }">${SvgRenderer.escape(label)}</text>`,
        ].join('');
    }

    private static buildPlate(formattedLicense: string): string {
        const plate = DutchPlate.buildFragment(formattedLicense);
        const scale = this.PLATE_WIDTH / plate.width;
        const y = this.HEIGHT - this.PAD_BOTTOM - plate.height * scale;

        return `<g transform="translate(${this.PAD_X} ${y}) scale(${scale})">${plate.markup}</g>`;
    }

    private static buildFacts(facts: HeroCardFact[]): string {
        if (facts.length === 0) {
            return '';
        }

        const labelAttributes = SvgText.bold(this.FACT_LABEL_SIZE, this.FACT_LABEL_TRACKING);
        const valueAttributes = SvgText.bold(this.FACT_VALUE_SIZE);

        const columns: { fact: HeroCardFact; label: string; width: number }[] = [];
        for (const fact of facts) {
            const label = fact.label.toUpperCase();
            const width = Math.max(
                SvgRenderer.measureTextWidth(label, labelAttributes),
                SvgRenderer.measureTextWidth(fact.value, valueAttributes)
            );
            columns.push({ fact, label, width });
        }

        let total = this.FACT_GAP * (columns.length - 1);
        for (const column of columns) {
            total += column.width;
        }

        const valueBaseline = this.HEIGHT - this.PAD_BOTTOM - 4;
        const labelBaseline = valueBaseline - this.FACT_VALUE_SIZE - 14;

        const parts: string[] = [];
        let x = this.WIDTH - this.PAD_X - total;

        for (const column of columns) {
            parts.push(
                `<text x="${x}" y="${labelBaseline}" ${labelAttributes} fill="${this.INK_DIM}">${SvgRenderer.escape(
                    column.label
                )}</text>`,
                `<text x="${x}" y="${valueBaseline}" ${valueAttributes} fill="${this.INK}">${SvgRenderer.escape(
                    column.fact.value
                )}</text>`
            );
            x += column.width + this.FACT_GAP;
        }

        return parts.join('');
    }
}
