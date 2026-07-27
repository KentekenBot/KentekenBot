import { LeaderboardView } from '../../src/util/leaderboard-view';
import { LeaderboardResult } from '../../src/types/leaderboard';

function textContents(containers: ReturnType<typeof LeaderboardView.build>): string {
    const contents: string[] = [];

    for (const container of containers) {
        for (const component of container.toJSON().components) {
            if ('content' in component && typeof component.content === 'string') {
                contents.push(component.content);
            }
        }
    }

    return contents.join('\n');
}

describe('LeaderboardView', () => {
    it('shows an empty message when there are no spots', () => {
        const result: LeaderboardResult = { spotters: [], topVehicle: null, totalSpots: 0 };

        const contents = textContents(LeaderboardView.build(result));

        expect(contents).toContain('nog geen spots');
        expect(contents).not.toContain('Meest gespot');
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

        const contents = textContents(LeaderboardView.build(result));

        expect(contents).toContain('🥇 <@a> — 4 spots');
        expect(contents).toContain('🥈 <@b> — 3 spots');
        expect(contents).toContain('🥉 <@c> — 1 spot');
        expect(contents).toContain('**4.** <@d> — 1 spot');
        expect(contents).toContain('-# 9 spots in totaal');
    });

    it('formats the most spotted vehicle with brand and plate', () => {
        const result: LeaderboardResult = {
            spotters: [{ discordUserId: 'a', count: 4 }],
            topVehicle: { license: 'AB123C', count: 4, brand: 'VOLKSWAGEN', tradeName: 'GOLF' },
            totalSpots: 4,
        };

        const contents = textContents(LeaderboardView.build(result));

        expect(contents).toContain('**Meest gespot**\n**Volkswagen Golf** (`AB-123-C`) — 4 keer gespot');
    });

    it('falls back to the plate when the vehicle has no brand', () => {
        const result: LeaderboardResult = {
            spotters: [{ discordUserId: 'a', count: 1 }],
            topVehicle: { license: 'AB123C', count: 1, brand: null, tradeName: null },
            totalSpots: 1,
        };

        const contents = textContents(LeaderboardView.build(result));

        expect(contents).toContain('`AB-123-C` — 1 keer gespot');
    });
});
