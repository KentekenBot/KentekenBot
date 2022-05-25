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

    public static toSnakeCase(str: string): string {
        return str
            .replace(/\d+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .join('_')
            .toLowerCase();
    }
}
