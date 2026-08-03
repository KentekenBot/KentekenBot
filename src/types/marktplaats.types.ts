export interface MarktplaatsAttribute {
    key?: string;
    value?: string;
}

export interface MarktplaatsListing {
    title?: string;
    description?: string;
    categorySpecificDescription?: string;
    vipUrl?: string;
    reserved?: boolean;
    priceInfo?: {
        priceCents?: number;
        priceType?: string;
    };
    attributes?: MarktplaatsAttribute[];
}

export interface MarktplaatsSearchResponse {
    listings?: MarktplaatsListing[];
}
