export class DutchPlate {
    private static readonly ESC = '\u001b';

    public static render(formattedLicense: string): string {
        const blueStrip = `${this.ESC}[0;37;44m`;
        const yellowPlate = `${this.ESC}[0;30;43m`;
        const reset = `${this.ESC}[0m`;

        return `\`\`\`ansi\n${blueStrip}NL${yellowPlate} ${formattedLicense} ${reset}\n\`\`\``;
    }
}
