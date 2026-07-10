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
