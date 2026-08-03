import { ForSaleBadge } from '../../src/util/for-sale-badge';
import { formatCurrency } from '../../src/util/format-currency';

const URL = 'https://www.marktplaats.nl/v/auto-s/ford/m1-ford-ka';

describe('ForSaleBadge.message', () => {
    it('links the price to the advert', () => {
        const message = ForSaleBadge.message({ title: 'Ford Ka', url: URL, priceCents: 290000 });

        expect(message).toBe(`Deze auto staat **te koop** — [${formatCurrency(2900)}](${URL})`);
    });

    it('names the marketplace when the advert has no price', () => {
        const message = ForSaleBadge.message({ title: 'Ford Ka', url: URL, priceCents: null });

        expect(message).toBe(`Deze auto staat **te koop** — [Marktplaats](${URL})`);
    });

    it('puts the price in the tag drawn into the card', () => {
        const tag = ForSaleBadge.tag({ title: 'Ford Ka', url: URL, priceCents: 290000 });

        expect(tag).toBe(`TE KOOP · ${formatCurrency(2900)}`);
    });

    it('falls back to a bare tag when the advert has no price', () => {
        expect(ForSaleBadge.tag({ title: 'Ford Ka', url: URL, priceCents: null })).toBe('TE KOOP');
    });

    it('rounds a price given in cents down to whole euros', () => {
        const message = ForSaleBadge.message({ title: 'Ford Ka', url: URL, priceCents: 295050 });

        expect(message).toContain(formatCurrency(2950.5));
    });
});
