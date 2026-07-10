import { SuperlativesRanker } from '../../src/util/superlatives-ranker';
import { SuperlativeSpot } from '../../src/types/superlatives';

function spot(overrides: Partial<SuperlativeSpot> & { license: string }): SuperlativeSpot {
    return {
        brand: 'BRAND',
        tradeName: 'MODEL',
        price: null,
        dateFirstAllowed: null,
        spotterUserId: 'user-1',
        spottedAt: new Date('2024-01-01T00:00:00Z'),
        ...overrides,
    };
}

describe('SuperlativesRanker.byPrice', () => {
    it('sorts vehicles by price descending and drops price-less ones', () => {
        const ranked = SuperlativesRanker.byPrice(
            [
                spot({ license: 'A', price: 30000 }),
                spot({ license: 'B', price: 145000 }),
                spot({ license: 'C', price: null }),
                spot({ license: 'D', price: 52000 }),
            ],
            10
        );

        expect(ranked.map((entry) => entry.license)).toEqual(['B', 'D', 'A']);
    });

    it('respects the limit', () => {
        const ranked = SuperlativesRanker.byPrice(
            [spot({ license: 'A', price: 1 }), spot({ license: 'B', price: 2 }), spot({ license: 'C', price: 3 })],
            2
        );

        expect(ranked).toHaveLength(2);
        expect(ranked[0].license).toBe('C');
    });
});

describe('SuperlativesRanker.byAge', () => {
    it('sorts vehicles oldest first and drops date-less ones', () => {
        const ranked = SuperlativesRanker.byAge(
            [
                spot({ license: 'A', dateFirstAllowed: new Date('2019-01-01') }),
                spot({ license: 'B', dateFirstAllowed: new Date('1978-01-01') }),
                spot({ license: 'C', dateFirstAllowed: null }),
            ],
            10
        );

        expect(ranked.map((entry) => entry.license)).toEqual(['B', 'A']);
    });
});

describe('SuperlativesRanker de-duplication', () => {
    it('keeps only the most recent spot per plate', () => {
        const ranked = SuperlativesRanker.byPrice(
            [
                spot({ license: 'A', price: 30000, spotterUserId: 'old', spottedAt: new Date('2023-01-01') }),
                spot({ license: 'A', price: 30000, spotterUserId: 'new', spottedAt: new Date('2024-06-01') }),
            ],
            10
        );

        expect(ranked).toHaveLength(1);
        expect(ranked[0].spotterUserId).toBe('new');
    });
});
