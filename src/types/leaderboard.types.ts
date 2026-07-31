import { CountedVehicle } from './spot.types';

export interface SpotterRank {
    discordUserId: string;
    count: number;
}

export type TopVehicle = CountedVehicle;

export interface LeaderboardResult {
    spotters: SpotterRank[];
    topVehicle: TopVehicle | null;
    totalSpots: number;
}

export interface MostSpottedVehicle extends CountedVehicle {
    lastSpotterUserId: string;
}
