import { SearchView } from '../../src/util/search-view';
import { SearchResult, SearchSighting } from '../../src/types/search';

function textContents(containers: ReturnType<typeof SearchView.build>): string {
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

function buttonCustomIds(containers: ReturnType<typeof SearchView.build>): string[] {
    const customIds: string[] = [];

    for (const container of containers) {
        for (const component of container.toJSON().components) {
            if (!('components' in component) || !Array.isArray(component.components)) {
                continue;
            }
            for (const child of component.components) {
                if ('custom_id' in child && typeof child.custom_id === 'string') {
                    customIds.push(child.custom_id);
                }
            }
        }
    }

    return customIds;
}

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

        const contents = textContents(SearchView.build(result, { brand: 'Ferrari' }));

        expect(contents).toContain('Geen spots gevonden');
        expect(contents).toContain('merk "Ferrari"');
    });

    it('renders a matching sighting with plate, vehicle and spotter', () => {
        const result: SearchResult = { sightings: [sighting({ license: 'AB123C' })], totalCount: 1, shown: 1 };

        const contents = textContents(SearchView.build(result, { brand: 'Audi' }));

        expect(contents).toContain('`AB-123-C` **Audi A4**');
        expect(contents).toContain('🎨 Zwart');
        expect(contents).toContain('⛽ 190PK');
        expect(contents).toContain('<@user-1>');
        expect(contents).toContain('-# 1 resultaat · merk "Audi"');
    });

    it('notes when more results exist than are shown', () => {
        const result: SearchResult = { sightings: [sighting({ license: 'AB123C' })], totalCount: 25, shown: 1 };

        const contents = textContents(SearchView.build(result, { brand: 'Audi' }));

        expect(contents).toContain('25 resultaten');
        expect(contents).toContain('eerste 1 getoond');
    });

    it('includes a refine button carrying the current filters', () => {
        const result: SearchResult = { sightings: [sighting({ license: 'AB123C' })], totalCount: 1, shown: 1 };

        const customIds = buttonCustomIds(SearchView.build(result, { brand: 'Audi' }));

        expect(customIds).toEqual(['search:refine:Audi::']);
    });
});

describe('SearchView.buildPrompt', () => {
    it('explains the filters and includes the refine button', () => {
        const containers = SearchView.buildPrompt({});

        expect(textContents(containers)).toContain('minstens één filter');
        expect(buttonCustomIds(containers)).toEqual(['search:refine:::']);
    });
});
