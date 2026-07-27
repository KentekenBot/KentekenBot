import { Str } from './str';
import { License } from './license';

export class SpotSuggestion {
    public static normalizeQuery(input: string): string {
        return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    public static label(license: string, brand: string | null, tradeName: string | null): string {
        const formatted = License.format(license) || license;

        if (brand && tradeName) {
            const name = `${Str.toTitleCase(brand)} ${Str.toTitleCase(tradeName)}`;
            return Str.limitCharacters(`${formatted} (${name})`, 100);
        }

        return formatted;
    }
}
