import { Spot, SpotVehicle } from './spot.types';

export interface PaginatedVehicle extends SpotVehicle {
    country: string;
}

export interface PaginatedSighting extends Omit<Spot, 'vehicle'> {
    id: number;
    comment: string | null;
    vehicle: PaginatedVehicle | null;
}

export interface PaginatedResult {
    sightings: PaginatedSighting[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface SightingsSpotter {
    discordUserId: string;
    count: number;
}

export interface SightingsSummary {
    total: number;
    spotters: SightingsSpotter[];
    lastSightingAt: number;
    lastSightingUrl: string | null;
    lastComment: string | null;
    needsUpdate: boolean;
}
