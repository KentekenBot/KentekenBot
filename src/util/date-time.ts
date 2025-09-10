import { DiscordTimestamps } from '../enums/discord-timestamps';

export class DateTime {
    public static getDiscordTimestamp(timestamp: number, type = DiscordTimestamps.DEFAULT): string {
        if (!timestamp) {
            return 'Onbekende datum';
        }
        return `<t:${this.millisecondsToSeconds(timestamp)}${type ? ':' : ''}${type}>`;
    }

    public static millisecondsToSeconds(timestamp: number): number {
        return Math.round(timestamp / 1000);
    }
}
