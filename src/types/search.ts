export interface SearchFilters {
    brand?: string;
    color?: string;
    fuel?: string;
}

export interface SearchSighting {
    license: string;
    createdAt: Date;
    discordUserId: string;
    discordGuildId: string;
    discordChannelId: string;
    discordInteractionId: string;
    vehicle: {
        brand: string | null;
        tradeName: string | null;
        color: string | null;
        totalHorsepower: string | null;
        primaryFuelType: string | null;
    } | null;
}

export interface SearchResult {
    sightings: SearchSighting[];
    totalCount: number;
    shown: number;
}
