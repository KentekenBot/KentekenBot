import { SearchView } from '../../src/util/search-view';
import { SearchResult, SearchSighting } from '../../src/types/search';

function sighting(overrides: Partial<SearchSighting> & { license: string }): SearchSighting {
    return {
        createdAt: new Date('2024-01-01T00:00:00Z'),
        discordUserId: 'user-1',
        discordGuildId: 'guild-1',
        discordChannelId: 'chan-1',
        discordInteractionId: 'int-1',
        vehicle: {
            brand: 'AUDI',
            tradeName: 'A4',
            color: 'ZWART',
            totalHorsepower: '190',
            primaryFuelType: 'Benzine',
        },
        ...overrides,
    };
}

describe('SearchView.filterSummary', () => {
    it('joins the provided filters', () => {
        expect(SearchView.filterSummary({ brand: 'Audi', fuel: 'diesel' })).toBe('merk "Audi", brandstof "diesel"');
    });
});

describe('SearchView.build', () => {
    it('shows an empty message referencing the filters', () => {
        const result: SearchResult = { sightings: [], totalCount: 0, shown: 0 };

        const embed = SearchView.build(result, { brand: 'Ferrari' }).toJSON();

        expect(embed.description).toContain('Geen spots gevonden');
        expect(embed.description).toContain('merk "Ferrari"');
    });

    it('renders a matching sighting with plate, vehicle and spotter', () => {
        const result: SearchResult = { sightings: [sighting({ license: 'AB123C' })], totalCount: 1, shown: 1 };

        const embed = SearchView.build(result, { brand: 'Audi' }).toJSON();

        expect(embed.description).toContain('`AB-123-C` **Audi A4**');
        expect(embed.description).toContain('🎨 Zwart');
        expect(embed.description).toContain('⛽ 190PK');
        expect(embed.description).toContain('<@user-1>');
        expect(embed.footer?.text).toBe('1 resultaat · merk "Audi"');
    });

    it('notes when more results exist than are shown', () => {
        const result: SearchResult = { sightings: [sighting({ license: 'AB123C' })], totalCount: 25, shown: 1 };

        const embed = SearchView.build(result, { brand: 'Audi' }).toJSON();

        expect(embed.footer?.text).toContain('25 resultaten');
        expect(embed.footer?.text).toContain('eerste 1 getoond');
    });
});
