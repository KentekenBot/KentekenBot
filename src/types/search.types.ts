import { Spot } from './spot.types';

export interface SearchFilters {
    brand?: string;
    color?: string;
    fuel?: string;
    spotterId?: string;
}

export type SearchSighting = Spot;

export interface SearchResult {
    sightings: SearchSighting[];
    totalCount: number;
    shown: number;
}
