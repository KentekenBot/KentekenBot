import { Op, WhereOptions } from 'sequelize';
import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { SearchFilters, SearchResult, SearchSighting } from '../types/search';

export class Search {
    private static readonly LIMIT = 10;

    public static hasFilters(filters: SearchFilters): boolean {
        return Boolean(filters.brand || filters.color || filters.fuel);
    }

    public static async inGuild(discordGuildId: string, filters: SearchFilters): Promise<SearchResult> {
        const vehicleWhere: WhereOptions = {};

        if (filters.brand) {
            vehicleWhere.brand = { [Op.like]: `%${filters.brand}%` };
        }
        if (filters.color) {
            vehicleWhere.color = { [Op.like]: `%${filters.color}%` };
        }
        if (filters.fuel) {
            vehicleWhere.primaryFuelType = { [Op.like]: `%${filters.fuel}%` };
        }

        const { count, rows } = await Sighting.findAndCountAll({
            where: { discordGuildId },
            include: [
                {
                    model: Vehicle,
                    as: 'vehicle',
                    required: true,
                    where: vehicleWhere,
                },
            ],
            order: [['createdAt', 'DESC']],
            limit: this.LIMIT,
        });

        const sightings: SearchSighting[] = [];
        for (const row of rows) {
            const vehicle = row.vehicle;
            sightings.push({
                license: row.license,
                createdAt: row.createdAt,
                discordUserId: row.discordUserId,
                discordGuildId: row.discordGuildId,
                discordChannelId: row.discordChannelId,
                discordInteractionId: row.discordInteractionId,
                vehicle: vehicle
                    ? {
                          brand: vehicle.brand,
                          tradeName: vehicle.tradeName,
                          color: vehicle.color,
                          totalHorsepower: vehicle.totalHorsepower,
                          primaryFuelType: vehicle.primaryFuelType,
                      }
                    : null,
            });
        }

        return {
            sightings,
            totalCount: count,
            shown: sightings.length,
        };
    }
}
