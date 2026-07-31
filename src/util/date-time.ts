import { DiscordTimestamps } from '../enums/discord-timestamps';

export class DateTime {
    private static readonly MONTHS = [
        'jan',
        'feb',
        'mrt',
        'apr',
        'mei',
        'jun',
        'jul',
        'aug',
        'sep',
        'okt',
        'nov',
        'dec',
    ];

    public static getDiscordTimestamp(timestamp: number, type = DiscordTimestamps.DEFAULT): string {
        return `<t:${this.millisecondsToSeconds(timestamp)}${type ? ':' : ''}${type}>`;
    }

    // Drawn into an image, where a Discord timestamp cannot be resolved.
    public static toMonthAndYear(timestamp: number): string {
        const date = new Date(timestamp);

        return `${this.MONTHS[date.getMonth()]} ${date.getFullYear()}`;
    }

    public static millisecondsToSeconds(timestamp: number): number {
        return Math.round(timestamp / 1000);
    }
}
