import axios from 'axios';
import { MarketplaceCandidate, MarketplaceSource } from '../types/marketplace.types';
import { MarktplaatsListing, MarktplaatsSearchResponse } from '../types/marktplaats.types';

export class Marktplaats implements MarketplaceSource {
    public static readonly BASE_URL = 'https://www.marktplaats.nl';

    private static readonly SEARCH_URL = `${Marktplaats.BASE_URL}/lrp/api/search`;
    private static readonly TIMEOUT_MS = 2500;
    private static readonly LIMIT = 5;

    // Listings are sold and withdrawn, so this cache has to expire.
    private static readonly CACHE_TTL_MS = 1000 * 60 * 30;

    private static readonly cache = new Map<string, { candidates: MarketplaceCandidate[]; expiresAt: number }>();

    public async findCandidates(license: string, now = Date.now()): Promise<MarketplaceCandidate[]> {
        const key = Marktplaats.searchTerm(license);

        const cached = Marktplaats.cache.get(key);
        if (cached && cached.expiresAt > now) {
            return cached.candidates;
        }

        const listings = await this.search(key);
        const candidates: MarketplaceCandidate[] = [];
        for (const listing of listings) {
            candidates.push(Marktplaats.toCandidate(listing));
        }

        Marktplaats.cache.set(key, { candidates, expiresAt: now + Marktplaats.CACHE_TTL_MS });

        return candidates;
    }

    // Marktplaats strips the hyphens out of a search term before it matches, so
    // `80SXS1` finds an advert spelling the plate `80-sxs-1` while `80-SXS-1` finds
    // nothing at all.
    public static searchTerm(license: string): string {
        return license.toUpperCase().replace(/-/g, '');
    }

    private async search(term: string): Promise<MarktplaatsListing[]> {
        try {
            const response = await axios.get<MarktplaatsSearchResponse>(Marktplaats.SEARCH_URL, {
                timeout: Marktplaats.TIMEOUT_MS,
                params: {
                    query: term,
                    searchInTitleAndDescription: true,
                    limit: Marktplaats.LIMIT,
                },
                headers: {
                    // The endpoint refuses a request that does not look like the website.
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                    Accept: 'application/json',
                },
                validateStatus: function (status: number): boolean {
                    return status < 500;
                },
            });

            if (response.status !== 200) {
                return [];
            }

            return response.data?.listings ?? [];
        } catch {
            return [];
        }
    }

    private static toCandidate(listing: MarktplaatsListing): MarketplaceCandidate {
        // The short description is truncated, so the plate is often only in the long one.
        const descriptions = [listing.description ?? '', listing.categorySpecificDescription ?? ''];

        return {
            title: listing.title ?? '',
            description: descriptions.join(' ').trim(),
            model: Marktplaats.attribute(listing, 'model'),
            url: Marktplaats.absoluteUrl(listing.vipUrl),
            priceCents: listing.priceInfo?.priceCents ?? null,
            priceType: listing.priceInfo?.priceType ?? '',
            reserved: listing.reserved === true,
        };
    }

    private static attribute(listing: MarktplaatsListing, key: string): string | null {
        for (const attribute of listing.attributes ?? []) {
            if (attribute.key === key && attribute.value) {
                return attribute.value;
            }
        }

        return null;
    }

    // `vipUrl` is a path, not a url.
    private static absoluteUrl(vipUrl: string | undefined): string {
        if (!vipUrl) {
            return '';
        }

        return vipUrl.startsWith('http') ? vipUrl : `${Marktplaats.BASE_URL}${vipUrl}`;
    }
}
