export interface SuperlativeSpot {
    license: string;
    brand: string | null;
    tradeName: string | null;
    price: number | null;
    dateFirstAllowed: Date | null;
    spotterUserId: string;
    spottedAt: Date;
}

export interface RankedVehicle {
    license: string;
    brand: string | null;
    tradeName: string | null;
    price: number | null;
    dateFirstAllowed: Date | null;
    spotterUserId: string;
}

export type SuperlativeMode = 'price' | 'age';
