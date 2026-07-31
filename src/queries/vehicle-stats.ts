import { WhereOptions } from 'sequelize';
import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { StatsCalculator } from '../util/stats-calculator';
import { StatsProfile, StatSpot } from '../types/stats.types';

export class VehicleStats {
    // Scoped to the guild the profile is asked in, like every other board. A guild
    // member can ask for anyone's stats, and without the scope that answer would
    // include spots made in other servers and in dms.
    public static async forUser(discordUserId: string, discordGuildId: string | null): Promise<StatsProfile> {
        const where: WhereOptions = { discordUserId };

        if (discordGuildId) {
            where.discordGuildId = discordGuildId;
        }

        const sightings = await Sighting.findAll({
            where,
            include: [
                {
                    model: Vehicle,
                    as: 'vehicle',
                    required: false,
                },
            ],
        });

        const spots: StatSpot[] = [];
        for (const sighting of sightings) {
            const vehicle = sighting.vehicle;
            spots.push({
                license: sighting.license,
                createdAt: sighting.createdAt,
                vehicle: vehicle
                    ? {
                          brand: vehicle.brand,
                          tradeName: vehicle.tradeName,
                          price: vehicle.price,
                          primaryFuelType: vehicle.primaryFuelType,
                          dateFirstAllowed: vehicle.dateFirstAllowed ?? null,
                      }
                    : null,
            });
        }

        return StatsCalculator.compute(spots);
    }
}
