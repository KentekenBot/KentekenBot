export interface ForSaleListing {
    title: string;
    url: string;
    priceCents: number | null;
}

export interface MarketplaceCandidate {
    title: string;
    description: string;
    model: string | null;
    url: string;
    priceCents: number | null;
    priceType: string;
    reserved: boolean;
}

export interface MarketplaceSource {
    findCandidates(license: string): Promise<MarketplaceCandidate[]>;
}
