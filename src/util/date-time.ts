export class DateTime {
    public static getDiscordTimestamp(timestamp: number): string {
        return `<t:${this.millisecondsToSeconds(timestamp)}:R>`;
    }

    public static millisecondsToSeconds(timestamp: number): number {
        return Math.round(timestamp / 1000);
    }
}
