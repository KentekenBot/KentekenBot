import { StatsView } from '../../src/util/stats-view';
import { StatsProfile } from '../../src/types/stats';
import { formatCurrency } from '../../src/util/format-currency';

function textContents(containers: ReturnType<typeof StatsView.build>): string[] {
    const contents: string[] = [];

    for (const container of containers) {
        for (const component of container.toJSON().components) {
            if ('content' in component && typeof component.content === 'string') {
                contents.push(component.content);
            }
        }
    }

    return contents;
}

const emptyProfile: StatsProfile = {
    totalSpots: 0,
    uniquePlates: 0,
    favoriteBrand: null,
    mostExpensive: null,
    oldest: null,
    electricCount: 0,
    fuelCount: 0,
    firstSpotAt: null,
};

describe('StatsView.build', () => {
    it('renders a components v2 container with the display name as title', () => {
        const containers = StatsView.build(emptyProfile, 'Patrick');

        expect(containers).toHaveLength(1);
        expect(textContents(containers)[0]).toBe("## 📊 Patrick's stats");
    });

    it('shows a call to action when there are no spots', () => {
        const contents = textContents(StatsView.build(emptyProfile, 'Patrick'));

        expect(contents.join('\n')).toContain('Nog geen spots');
    });

    it('renders counts, highlights and the first-spot footer', () => {
        const profile: StatsProfile = {
            totalSpots: 4,
            uniquePlates: 2,
            favoriteBrand: { name: 'VOLKSWAGEN', count: 3 },
            mostExpensive: { brand: 'PORSCHE', tradeName: '911', license: 'XY999Z', price: 145000 },
            oldest: { brand: 'MERCEDES', tradeName: '280 SL', license: 'OL111D', date: new Date('1978-05-20') },
            electricCount: 1,
            fuelCount: 3,
            firstSpotAt: new Date('2024-01-01T00:00:00Z'),
        };

        const contents = textContents(StatsView.build(profile, 'Patrick')).join('\n');

        expect(contents).toContain('**Spots:** 4');
        expect(contents).toContain('**Unieke kentekens:** 2');
        expect(contents).toContain('**Brandstof:** ⚡ 1 · ⛽ 3');
        expect(contents).toContain('**Favoriet merk:** Volkswagen (3x)');
        expect(contents).toContain(`**Duurste:** Porsche 911 — ${formatCurrency(145000)}`);
        expect(contents).toContain('**Oudste:** 1978 Mercedes 280 Sl');
        expect(contents).toContain('-# Eerste spot <t:1704067200:R>');
    });
});
