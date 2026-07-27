export class DutchPlate {
    private static readonly ESC = '\u001b';
    private static readonly PLATE_PADDING = 2;

    public static render(formattedLicense: string): string {
        const blueStrip = `${this.ESC}[1;37;44m`;
        const yellowPlate = `${this.ESC}[1;30;43m`;
        const reset = `${this.ESC}[0m`;

        const padding = ' '.repeat(this.PLATE_PADDING);

        return `\`\`\`ansi\n${blueStrip} NL ${yellowPlate}${padding}${formattedLicense}${padding}${reset}\n\`\`\``;
    }
}
