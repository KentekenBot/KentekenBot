export interface HeroCardFact {
    label: string;
    value: string;
}

export interface HeroCardData {
    brand: string;
    model: string;
    formattedLicense: string;
    logo: Buffer;
    facts: HeroCardFact[];
}
