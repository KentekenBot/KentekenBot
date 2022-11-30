export class Str {
    public static toTitleCase(str: string): string {
        return str
            .toLowerCase()
            .split(' ')
            .map((word) => Str.capitalizeFirst(word))
            .join(' ');
    }

    public static capitalizeFirst(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public static humanToSnakeCase(str: string): string {
        return str.toLowerCase().replace(/ /g, '_');
    }

    public static limitCharacters(str: string, limit: number): string {
        return str.length > limit ? str.substring(0, limit) : str;
    }
}
