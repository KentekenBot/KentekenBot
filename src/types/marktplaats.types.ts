// Every field is optional: this is the website's own endpoint, not a documented API,
// so it can change shape without notice.
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
