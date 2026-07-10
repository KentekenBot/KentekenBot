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

function textContents(containers: ReturnType<typeof BoardsView.buildMostSpotted>): string {
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

describe('BoardsView.buildMostSpotted', () => {
    it('shows an empty message when there are no spots', () => {
        const contents = textContents(BoardsView.buildMostSpotted([]));

        expect(contents).toContain('nog geen spots');
    });

    it('ranks vehicles with count and last spotter', () => {
        const vehicles: MostSpottedVehicle[] = [
            { license: 'AB123C', count: 4, lastSpotterUserId: 'user-1', brand: 'VOLKSWAGEN', tradeName: 'GOLF' },
            { license: 'XY999Z', count: 2, lastSpotterUserId: 'user-2', brand: null, tradeName: null },
        ];

        const contents = textContents(BoardsView.buildMostSpotted(vehicles));

        expect(contents).toContain('**1.** **Volkswagen Golf** (`AB-123-C`) — 4× · laatst door <@user-1>');
        expect(contents).toContain('**2.** `XY-999-Z` — 2× · laatst door <@user-2>');
    });
});

describe('BoardsView.attachTabs', () => {
    it('appends the tab row to the last container', () => {
        const containers = BoardsView.attachTabs(BoardsView.buildMostSpotted([]), 'mostSpotted');

        const components = containers[containers.length - 1].toJSON().components;
        const lastComponent = components[components.length - 1];

        expect('components' in lastComponent && Array.isArray(lastComponent.components)).toBe(true);
        if ('components' in lastComponent && Array.isArray(lastComponent.components)) {
            expect(lastComponent.components).toHaveLength(5);
        }
    });
});
