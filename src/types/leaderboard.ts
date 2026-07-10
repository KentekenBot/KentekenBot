export interface SpotterRank {
    discordUserId: string;
    count: number;
}

export interface TopVehicle {
    license: string;
    count: number;
    brand: string | null;
    tradeName: string | null;
}

export interface LeaderboardResult {
    spotters: SpotterRank[];
    topVehicle: TopVehicle | null;
    totalSpots: number;
}

export interface MostSpottedVehicle {
    license: string;
    count: number;
    lastSpotterUserId: string;
    brand: string | null;
    tradeName: string | null;
}
