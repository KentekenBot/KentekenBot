import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { SuperlativesRanker } from '../util/superlatives-ranker';
import { RankedVehicle, SuperlativeSpot } from '../types/superlatives.types';

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
        // The inner join is deliberate here: these boards rank on price and build
        // date, so a sighting without a vehicle row has nothing to rank on and is
        // skipped below anyway. Legacy sightings used to be missing from the boards
        // because their vehicleId was never filled in, which the backfill migration
        // fixes at the source.
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
