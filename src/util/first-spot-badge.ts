import { Str } from './str';

export class FirstSpotBadge {
    public static message(brand: string, tradeName: string): string {
        const name = `${Str.toTitleCase(brand)} ${Str.toTitleCase(tradeName)}`.trim();

        return `Je bent de eerste in de server die een **${name}** heeft gespot!`;
    }
}
