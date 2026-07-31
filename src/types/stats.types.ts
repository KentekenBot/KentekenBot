import { NamedVehicle } from './spot.types';

export interface StatVehicle {
    brand: string | null;
    tradeName: string | null;
    price: number | null;
    primaryFuelType: string | null;
    dateFirstAllowed: Date | null;
}

export interface StatSpot {
    license: string;
    createdAt: Date;
    vehicle: StatVehicle | null;
}

export interface StatsProfile {
    totalSpots: number;
    uniquePlates: number;
    favoriteBrand: { name: string; count: number } | null;
    mostExpensive: (NamedVehicle & { price: number }) | null;
    oldest: (NamedVehicle & { date: Date }) | null;
    electricCount: number;
    fuelCount: number;
    firstSpotAt: Date | null;
}
