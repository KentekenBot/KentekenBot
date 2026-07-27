export interface RandomSpot {
    license: string;
    comment: string | null;
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
