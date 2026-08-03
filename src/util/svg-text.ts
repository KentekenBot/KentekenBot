import { SvgRenderer } from './svg-renderer';

export class SvgText {
    public static bold(size: number, tracking: number | null = null): string {
        const attributes = [
            `font-family="${SvgRenderer.TEXT_FONT_FAMILY}"`,
            `font-size="${size}"`,
            'font-weight="bold"',
        ];

        if (tracking !== null) {
            attributes.push(`letter-spacing="${tracking}"`);
        }

        return attributes.join(' ');
    }

    public static boldWidth(text: string, size: number, tracking: number | null = null): number {
        return SvgRenderer.measureTextWidth(text, this.bold(size, tracking));
    }
}
