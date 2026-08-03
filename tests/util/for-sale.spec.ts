import { ForSale } from '../../src/util/for-sale';
import { MarketplaceCandidate } from '../../src/types/marketplace.types';

function candidate(overrides: Partial<MarketplaceCandidate> = {}): MarketplaceCandidate {
    return {
        title: 'Ford Ka 1.2 69pk 2012 Wit',
        description: 'Nette ford ka 1.2 (kenteken: 12-abc-3).',
        model: 'Ka',
        url: 'https://www.marktplaats.nl/v/auto-s/ford/m1-ford-ka',
        priceCents: 290000,
        priceType: 'FIXED',
        reserved: false,
        ...overrides,
    };
}

describe('ForSale.verify', () => {
    it('accepts an advert for the same brand', () => {
        expect(ForSale.verify([candidate()], 'FORD')).toEqual({
            title: 'Ford Ka 1.2 69pk 2012 Wit',
            url: 'https://www.marktplaats.nl/v/auto-s/ford/m1-ford-ka',
            priceCents: 290000,
        });
    });

    it('accepts a brand the advert shortened', () => {
        const shortened = candidate({
            title: 'Mercedes C200 AMG-line',
            description: 'kenteken 12-abc-3',
            model: 'C-Klasse',
        });

        expect(ForSale.verify([shortened], 'MERCEDES-BENZ')).not.toBeNull();
    });

    it('accepts a brand that only appears in the description', () => {
        const buried = candidate({ title: 'Nette gezinsauto met nieuwe APK', model: null });

        expect(ForSale.verify([buried], 'FORD')).not.toBeNull();
    });

    it('rejects an advert for another car that happens to quote the plate', () => {
        expect(ForSale.verify([candidate()], 'OPEL')).toBeNull();
    });

    it('rejects a parts advert quoting its donor car', () => {
        const parts = candidate({ title: 'Ford Ka onderdelen, alles moet weg' });

        expect(ForSale.verify([parts], 'FORD')).toBeNull();
    });

    it('rejects a scrap advert', () => {
        const scrap = candidate({ title: 'Sloopauto Ford Ka 2012' });

        expect(ForSale.verify([scrap], 'FORD')).toBeNull();
    });

    it('still accepts an advert that only mentions parts in its description', () => {
        const honest = candidate({ description: 'Ford ka, geen onderdelen vervangen, kenteken 12-abc-3' });

        expect(ForSale.verify([honest], 'FORD')).not.toBeNull();
    });

    it('rejects a reserved advert', () => {
        expect(ForSale.verify([candidate({ reserved: true })], 'FORD')).toBeNull();
    });

    it('rejects a lease advert, which is not the car being sold', () => {
        expect(ForSale.verify([candidate({ priceType: 'LEASE' })], 'FORD')).toBeNull();
    });

    it('rejects an unrecognised price type rather than assuming a sale', () => {
        expect(ForSale.verify([candidate({ priceType: 'EXCHANGE' })], 'FORD')).toBeNull();
    });

    it('accepts an advert without a price', () => {
        const noPrice = candidate({ priceCents: null, priceType: 'NOTK' });

        expect(ForSale.verify([noPrice], 'FORD')?.priceCents).toBeNull();
    });

    it('rejects a listing it cannot link to', () => {
        expect(ForSale.verify([candidate({ url: '' })], 'FORD')).toBeNull();
    });

    it('does not match a short leading brand word against ordinary Dutch', () => {
        const unrelated = candidate({
            title: 'Volkswagen Golf in landelijke omgeving',
            description: 'kenteken 12-abc-3',
            model: 'Golf',
        });

        expect(ForSale.verify([unrelated], 'LAND ROVER')).toBeNull();
    });

    it('still matches a full multi-word brand', () => {
        const defender = candidate({ title: 'Land Rover Defender 110', model: 'Defender' });

        expect(ForSale.verify([defender], 'LAND ROVER')).not.toBeNull();
    });

    it('returns the first advert that survives the guard', () => {
        const rejected = candidate({ title: 'Ford Ka onderdelen' });
        const accepted = candidate({ url: 'https://www.marktplaats.nl/v/auto-s/ford/m2-ford-ka' });

        expect(ForSale.verify([rejected, accepted], 'FORD')?.url).toBe(
            'https://www.marktplaats.nl/v/auto-s/ford/m2-ford-ka'
        );
    });

    it('returns nothing when no advert mentions the plate', () => {
        expect(ForSale.verify([], 'FORD')).toBeNull();
    });

    it('returns nothing when the brand is unknown', () => {
        expect(ForSale.verify([candidate()], '')).toBeNull();
    });
});
