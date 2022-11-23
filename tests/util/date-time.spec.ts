import { DateTime } from '../../src/util/date-time';
import { DiscordTimestamps } from '../../src/enums/discord-timestamps';

describe('Date time helper class', () => {
    it('should format discord timestamps according to enum', () => {
        expect(DateTime.getDiscordTimestamp(100000)).toBe('<t:100>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.DEFAULT)).toBe('<t:100>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.SHORT_TIME)).toBe('<t:100:t>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.LONG_TIME)).toBe('<t:100:T>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.SHORT_DATE)).toBe('<t:100:d>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.LONG_DATE)).toBe('<t:100:D>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.SHORT_DATE_TIME)).toBe('<t:100:f>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.LONG_DATE_TIME)).toBe('<t:100:F>');
        expect(DateTime.getDiscordTimestamp(100000, DiscordTimestamps.RELATIVE)).toBe('<t:100:R>');
    });
});
