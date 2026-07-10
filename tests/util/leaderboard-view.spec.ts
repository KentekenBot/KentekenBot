import { LeaderboardView } from '../../src/util/leaderboard-view';
import { LeaderboardResult } from '../../src/types/leaderboard';

describe('LeaderboardView', () => {
    it('shows an empty message when there are no spots', () => {
        const result: LeaderboardResult = { spotters: [], topVehicle: null, totalSpots: 0 };

        const embed = LeaderboardView.build(result).toJSON();

        expect(embed.description).toContain('nog geen spots');
        expect(embed.fields ?? []).toHaveLength(0);
    });

    it('ranks spotters with medals for the top three', () => {
        const result: LeaderboardResult = {
            spotters: [
                { discordUserId: 'a', count: 4 },
                { discordUserId: 'b', count: 3 },
                { discordUserId: 'c', count: 1 },
                { discordUserId: 'd', count: 1 },
            ],
            topVehicle: null,
            totalSpots: 9,
        };

        const embed = LeaderboardView.build(result).toJSON();

        expect(embed.description).toContain('🥇 <@a> — 4 spots');
        expect(embed.description).toContain('🥈 <@b> — 3 spots');
        expect(embed.description).toContain('🥉 <@c> — 1 spot');
        expect(embed.description).toContain('**4.** <@d> — 1 spot');
    });

    it('formats the most spotted vehicle with brand and plate', () => {
        const result: LeaderboardResult = {
            spotters: [{ discordUserId: 'a', count: 4 }],
            topVehicle: { license: 'AB123C', count: 4, brand: 'VOLKSWAGEN', tradeName: 'GOLF' },
            totalSpots: 4,
        };

        const embed = LeaderboardView.build(result).toJSON();
        const topField = (embed.fields ?? []).find((field) => field.name === 'Meest gespot');

        expect(topField?.value).toBe('**Volkswagen Golf** (`AB-123-C`) — 4 keer gespot');
    });

    it('falls back to the plate when the vehicle has no brand', () => {
        const result: LeaderboardResult = {
            spotters: [{ discordUserId: 'a', count: 1 }],
            topVehicle: { license: 'AB123C', count: 1, brand: null, tradeName: null },
            totalSpots: 1,
        };

        const embed = LeaderboardView.build(result).toJSON();
        const topField = (embed.fields ?? []).find((field) => field.name === 'Meest gespot');

        expect(topField?.value).toBe('`AB-123-C` — 1 keer gespot');
    });
});
