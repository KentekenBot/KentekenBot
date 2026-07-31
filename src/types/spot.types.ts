export interface SpotVehicle {
    brand: string | null;
    tradeName: string | null;
    color: string | null;
    totalHorsepower: string | null;
    primaryFuelType: string | null;
}

export interface SpotOrigin {
    discordUserId: string;
    discordGuildId: string;
    discordChannelId: string;
    discordInteractionId: string;
}

export interface Spot extends SpotOrigin {
    license: string;
    createdAt: Date;
    vehicle: SpotVehicle | null;
}

export interface NamedVehicle {
    license: string;
    brand: string | null;
    tradeName: string | null;
}

export interface CountedVehicle extends NamedVehicle {
    count: number;
}
