import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { SuperlativesRanker } from '../util/superlatives-ranker';
import { RankedVehicle, SuperlativeSpot } from '../types/superlatives';

export class Superlatives {
    private static readonly LIMIT = 10;

    public static async mostExpensive(discordGuildId: string): Promise<RankedVehicle[]> {
        const spots = await this.loadGuildSpots(discordGuildId);
        return SuperlativesRanker.byPrice(spots, this.LIMIT);
    }

    public static async oldest(discordGuildId: string): Promise<RankedVehicle[]> {
        const spots = await this.loadGuildSpots(discordGuildId);
        return SuperlativesRanker.byAge(spots, this.LIMIT);
    }

    private static async loadGuildSpots(discordGuildId: string): Promise<SuperlativeSpot[]> {
        const sightings = await Sighting.findAll({
            where: { discordGuildId },
            include: [
                {
                    model: Vehicle,
                    as: 'vehicle',
                    required: true,
                },
            ],
        });

        const spots: SuperlativeSpot[] = [];
        for (const sighting of sightings) {
            const vehicle = sighting.vehicle;
            if (!vehicle) {
                continue;
            }

            spots.push({
                license: sighting.license,
                brand: vehicle.brand,
                tradeName: vehicle.tradeName,
                price: vehicle.price,
                dateFirstAllowed: vehicle.dateFirstAllowed ?? null,
                spotterUserId: sighting.discordUserId,
                spottedAt: sighting.createdAt,
            });
        }

        return spots;
    }
}
