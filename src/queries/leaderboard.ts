import { col, fn } from 'sequelize';
import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { LeaderboardResult, SpotterRank, TopVehicle } from '../types/leaderboard';

export class Leaderboard {
    private static readonly TOP_SPOTTERS = 10;

    public static async forGuild(discordGuildId: string): Promise<LeaderboardResult> {
        const [spotters, topVehicle, totalSpots] = await Promise.all([
            this.getTopSpotters(discordGuildId),
            this.getTopVehicle(discordGuildId),
            this.getTotalSpots(discordGuildId),
        ]);

        return { spotters, topVehicle, totalSpots };
    }

    private static async getTopSpotters(discordGuildId: string): Promise<SpotterRank[]> {
        const rows = await Sighting.findAll({
            attributes: ['discordUserId', [fn('COUNT', col('id')), 'count']],
            where: { discordGuildId },
            group: ['discordUserId'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            limit: this.TOP_SPOTTERS,
        });

        const spotters: SpotterRank[] = [];
        for (const row of rows) {
            spotters.push({
                discordUserId: row.discordUserId,
                count: Number(row.get('count')),
            });
        }

        return spotters;
    }

    private static async getTopVehicle(discordGuildId: string): Promise<TopVehicle | null> {
        const rows = await Sighting.findAll({
            attributes: ['license', [fn('COUNT', col('id')), 'count']],
            where: { discordGuildId },
            group: ['license'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            limit: 1,
        });

        const row = rows[0];
        if (!row) {
            return null;
        }

        const vehicle = await Vehicle.findOne({ where: { license: row.license } });

        return {
            license: row.license,
            count: Number(row.get('count')),
            brand: vehicle?.brand ?? null,
            tradeName: vehicle?.tradeName ?? null,
        };
    }

    private static async getTotalSpots(discordGuildId: string): Promise<number> {
        return Sighting.count({ where: { discordGuildId } });
    }
}
