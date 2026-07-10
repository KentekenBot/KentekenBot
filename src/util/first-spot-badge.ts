import { Str } from './str';

export class FirstSpotBadge {
    public static message(brand: string, tradeName: string): string {
        const name = `${Str.toTitleCase(brand)} ${Str.toTitleCase(tradeName)}`.trim();

        return `Niemand in deze server had de **${name}** al gespot!`;
    }
}
