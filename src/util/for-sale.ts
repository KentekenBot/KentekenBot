import { ForSaleListing, MarketplaceCandidate } from '../types/marketplace.types';

export class ForSale {
    // An allowlist, because an unrecognised price type must not be assumed to be a sale.
    private static readonly SALE_PRICE_TYPES = ['FIXED', 'MIN_BID', 'SEE_DESCRIPTION', 'NOTK', 'ON_REQUEST'];

    // Parts and scrap adverts quote the plate of their donor car.
    private static readonly PARTS_MARKERS = ['onderdel', 'sloop', 'donor', 'plaatwerk', 'motorblok'];

    public static verify(candidates: MarketplaceCandidate[], brand: string): ForSaleListing | null {
        for (const candidate of candidates) {
            if (this.isSelling(candidate, brand)) {
                return {
                    title: candidate.title,
                    url: candidate.url,
                    priceCents: candidate.priceCents,
                };
            }
        }

        return null;
    }

    private static isSelling(candidate: MarketplaceCandidate, brand: string): boolean {
        if (!candidate.url) {
            return false;
        }

        if (candidate.reserved) {
            return false;
        }

        if (!this.SALE_PRICE_TYPES.includes(candidate.priceType)) {
            return false;
        }

        if (this.looksLikeParts(candidate.title)) {
            return false;
        }

        return this.mentionsBrand(candidate, brand);
    }

    // Title only: these words turn up innocently in descriptions ("geen onderdelen
    // vervangen"), and a false negative only costs a badge.
    private static looksLikeParts(title: string): boolean {
        const haystack = title.toLowerCase();

        for (const marker of this.PARTS_MARKERS) {
            if (haystack.includes(marker)) {
                return true;
            }
        }

        return false;
    }

    private static mentionsBrand(candidate: MarketplaceCandidate, brand: string): boolean {
        const needle = brand.trim().toLowerCase();
        if (!needle) {
            return false;
        }

        const haystack = [candidate.title, candidate.description, candidate.model ?? ''].join(' ').toLowerCase();

        if (haystack.includes(needle)) {
            return true;
        }

        // The RDW spells a brand out in full where an advert shortens it, so
        // "MERCEDES-BENZ" has to match "Mercedes". The length floor keeps the leading
        // word from matching an ordinary Dutch word.
        const leading = needle.split(/[-\s]/)[0];

        return leading.length >= 5 && haystack.includes(leading);
    }
}
