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

    // `%` and `_` are wildcards in a LIKE pattern, so a filter of "%" would quietly
    // match every row. These filters hold brand, colour and fuel names, which never
    // contain either character, so they are dropped rather than escaped: escaping
    // needs an ESCAPE clause that differs per dialect, dropping cannot go wrong.
    public static withoutLikeWildcards(str: string): string {
        return str.replace(/[%_]/g, '');
    }

    public static limitCharacters(str: string, limit: number): string {
        return str.length > limit ? str.substring(0, limit) : str;
    }
}
