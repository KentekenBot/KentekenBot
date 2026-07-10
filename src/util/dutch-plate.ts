export class DutchPlate {
    private static readonly ESC = '\u001b';
    private static readonly STRIP_WIDTH = 4;
    private static readonly PLATE_PADDING = 2;

    public static render(formattedLicense: string): string {
        const blueStrip = `${this.ESC}[0;37;44m`;
        const blueStripBold = `${this.ESC}[1;37;44m`;
        const yellowPlate = `${this.ESC}[0;30;43m`;
        const yellowPlateBold = `${this.ESC}[1;30;43m`;
        const reset = `${this.ESC}[0m`;

        const plateWidth = formattedLicense.length + this.PLATE_PADDING * 2;
        const stripBlank = ' '.repeat(this.STRIP_WIDTH);
        const plateBlank = ' '.repeat(plateWidth);
        const platePadding = ' '.repeat(this.PLATE_PADDING);

        const paddingRow = `${blueStrip}${stripBlank}${yellowPlate}${plateBlank}${reset}`;
        const plateRow = `${blueStripBold} NL ${yellowPlateBold}${platePadding}${formattedLicense}${platePadding}${reset}`;

        return `\`\`\`ansi\n${paddingRow}\n${plateRow}\n${paddingRow}\n\`\`\``;
    }
}
