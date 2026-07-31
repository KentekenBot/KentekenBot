import { NamedVehicle } from './spot.types';

export interface RankedVehicle extends NamedVehicle {
    price: number | null;
    dateFirstAllowed: Date | null;
    spotterUserId: string;
}

export interface SuperlativeSpot extends RankedVehicle {
    spottedAt: Date;
}

export type SuperlativeMode = 'price' | 'age';
