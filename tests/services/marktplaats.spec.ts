import axios from 'axios';
import { Marktplaats } from '../../src/services/marktplaats';
import { MarktplaatsListing } from '../../src/types/marktplaats.types';

jest.mock('axios');

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>;

const SEARCH_URL = 'https://www.marktplaats.nl/lrp/api/search';
const CACHE_TTL_MS = 1000 * 60 * 30;

function listing(overrides: Partial<MarktplaatsListing> = {}): MarktplaatsListing {
    return {
        title: 'Ford Ka 1.2 69pk 2012 Wit',
        description: 'Nette ford ka 1.2 (kenteken: 12-abc-3).',
        categorySpecificDescription: 'Nette ford ka 1.2 (kenteken: 12-abc-3). Deze auto is van mijn moeder geweest.',
        vipUrl: '/v/auto-s/ford/m0000000001-ford-ka-1-2-69pk-2012-wit',
        reserved: false,
        priceInfo: { priceCents: 290000, priceType: 'FIXED' },
        attributes: [
            { key: 'constructionYear', value: '2012' },
            { key: 'model', value: 'Ka' },
        ],
        ...overrides,
    };
}

function response(status: number, listings: MarktplaatsListing[] = []) {
    return { status, data: { listings } };
}

describe('Marktplaats.searchTerm', () => {
    it('strips the hyphens a plate is written with', () => {
        expect(Marktplaats.searchTerm('12-abc-3')).toBe('12ABC3');
    });
});

describe('Marktplaats.findCandidates', () => {
    beforeEach(() => {
        mockedGet.mockReset();
    });

    // The hyphenated term matches nothing at all on Marktplaats, so this is the one
    // detail the whole lookup rests on.
    it('searches for the plate without its hyphens', async () => {
        mockedGet.mockResolvedValue(response(200, [listing()]));

        await new Marktplaats().findCandidates('12-ABC-3');

        expect(mockedGet).toHaveBeenCalledWith(
            SEARCH_URL,
            expect.objectContaining({
                params: expect.objectContaining({ query: '12ABC3', searchInTitleAndDescription: true }),
            })
        );
    });

    it('maps a listing onto a candidate', async () => {
        mockedGet.mockResolvedValue(response(200, [listing()]));

        const candidates = await new Marktplaats().findCandidates('11AAA1');

        expect(candidates).toHaveLength(1);
        expect(candidates[0]).toEqual({
            title: 'Ford Ka 1.2 69pk 2012 Wit',
            description: expect.stringContaining('Deze auto is van mijn moeder geweest.'),
            model: 'Ka',
            url: 'https://www.marktplaats.nl/v/auto-s/ford/m0000000001-ford-ka-1-2-69pk-2012-wit',
            priceCents: 290000,
            priceType: 'FIXED',
            reserved: false,
        });
    });

    it('keeps the plate from the truncated description as well as the long one', async () => {
        mockedGet.mockResolvedValue(response(200, [listing()]));

        const candidates = await new Marktplaats().findCandidates('22BBB2');

        expect(candidates[0].description).toContain('kenteken: 12-abc-3');
    });

    it('leaves an absolute vipUrl alone', async () => {
        mockedGet.mockResolvedValue(response(200, [listing({ vipUrl: 'https://www.marktplaats.nl/v/elders' })]));

        const candidates = await new Marktplaats().findCandidates('33CCC3');

        expect(candidates[0].url).toBe('https://www.marktplaats.nl/v/elders');
    });

    it('copes with a listing that is missing every optional field', async () => {
        mockedGet.mockResolvedValue(response(200, [{}]));

        const candidates = await new Marktplaats().findCandidates('44DDD4');

        expect(candidates[0]).toEqual({
            title: '',
            description: '',
            model: null,
            url: '',
            priceCents: null,
            priceType: '',
            reserved: false,
        });
    });

    it('returns nothing when no advert mentions the plate', async () => {
        mockedGet.mockResolvedValue(response(200, []));

        expect(await new Marktplaats().findCandidates('55EEE5')).toEqual([]);
    });

    it('returns nothing when the endpoint answers with an error status', async () => {
        mockedGet.mockResolvedValue(response(404));

        expect(await new Marktplaats().findCandidates('66FFF6')).toEqual([]);
    });

    it('returns nothing when the request fails', async () => {
        mockedGet.mockRejectedValue(new Error('timeout'));

        expect(await new Marktplaats().findCandidates('77GGG7')).toEqual([]);
    });

    it('caches per plate', async () => {
        mockedGet.mockResolvedValue(response(200, [listing()]));

        await new Marktplaats().findCandidates('88HHH8');
        await new Marktplaats().findCandidates('88HHH8');

        expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it('caches a miss too, so an ordinary plate is only looked up once', async () => {
        mockedGet.mockResolvedValue(response(200, []));

        await new Marktplaats().findCandidates('99JJJ9');
        await new Marktplaats().findCandidates('99JJJ9');

        expect(mockedGet).toHaveBeenCalledTimes(1);
    });

    it('looks the plate up again once the cached answer has expired', async () => {
        mockedGet.mockResolvedValue(response(200, [listing()]));

        // The only test that needs a clock at all, so it gets the two instants it
        // needs rather than a date: the cache is filled, then read back too late.
        await new Marktplaats().findCandidates('10KKK1', 0);
        await new Marktplaats().findCandidates('10KKK1', CACHE_TTL_MS + 1);

        expect(mockedGet).toHaveBeenCalledTimes(2);
    });
});
