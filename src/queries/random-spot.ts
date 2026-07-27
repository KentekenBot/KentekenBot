import { literal } from 'sequelize';
import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { RandomSpot } from '../types/random-spot';

export class RandomSpots {
    public static async get(discordGuildId: string | null, discordUserId: string | null): Promise<RandomSpot | null> {
        const where: Record<string, string> = {};

        if (discordGuildId) {
            where.discordGuildId = discordGuildId;
        }

        if (discordUserId) {
            where.discordUserId = discordUserId;
        }

        const sighting = await Sighting.findOne({
            where,
            order: literal('RANDOM()'),
            include: [
                {
                    model: Vehicle,
                    as: 'vehicle',
                    required: false,
                },
            ],
        });

        if (!sighting) {
            return null;
        }

        const vehicle = sighting.vehicle;

        return {
            license: sighting.license,
            comment: sighting.comment,
            createdAt: sighting.createdAt,
            discordUserId: sighting.discordUserId,
            discordGuildId: sighting.discordGuildId,
            discordChannelId: sighting.discordChannelId,
            discordInteractionId: sighting.discordInteractionId,
            vehicle: vehicle
                ? {
                      brand: vehicle.brand,
                      tradeName: vehicle.tradeName,
                      color: vehicle.color,
                      totalHorsepower: vehicle.totalHorsepower,
                      primaryFuelType: vehicle.primaryFuelType,
                  }
                : null,
        };
    }
}
