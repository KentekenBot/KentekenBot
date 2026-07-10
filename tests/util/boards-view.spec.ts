import { ButtonStyle } from 'discord.js';
import { BoardsView } from '../../src/util/boards-view';
import { MostSpottedVehicle } from '../../src/types/leaderboard';

describe('BoardsView.buildTabs', () => {
    it('renders all five tabs with leaderboard custom ids', () => {
        const row = BoardsView.buildTabs('spotters').toJSON();

        expect(row.components).toHaveLength(5);

        const customIds: (string | undefined)[] = [];
        for (const component of row.components) {
            customIds.push('custom_id' in component ? component.custom_id : undefined);
        }

        expect(customIds).toEqual([
            'leaderboard:spotters',
            'leaderboard:expensive',
            'leaderboard:oldest',
            'leaderboard:mostSpotted',
            'leaderboard:stats',
        ]);
    });

    it('marks the active tab as primary and disabled', () => {
        const row = BoardsView.buildTabs('oldest').toJSON();

        const oldest = row.components[2];
        expect(oldest.style).toBe(ButtonStyle.Primary);
        expect(oldest.disabled).toBe(true);

        const spotters = row.components[0];
        expect(spotters.style).toBe(ButtonStyle.Secondary);
        expect(spotters.disabled).toBe(false);
    });
});

describe('BoardsView.buildMostSpotted', () => {
    it('shows an empty message when there are no spots', () => {
        const embed = BoardsView.buildMostSpotted([]).toJSON();

        expect(embed.description).toContain('nog geen spots');
    });

    it('ranks vehicles with count and last spotter', () => {
        const vehicles: MostSpottedVehicle[] = [
            { license: 'AB123C', count: 4, lastSpotterUserId: 'user-1', brand: 'VOLKSWAGEN', tradeName: 'GOLF' },
            { license: 'XY999Z', count: 2, lastSpotterUserId: 'user-2', brand: null, tradeName: null },
        ];

        const embed = BoardsView.buildMostSpotted(vehicles).toJSON();

        expect(embed.description).toContain('**1.** **Volkswagen Golf** (`AB-123-C`) — 4× · laatst door <@user-1>');
        expect(embed.description).toContain('**2.** `XY-999-Z` — 2× · laatst door <@user-2>');
    });
});
