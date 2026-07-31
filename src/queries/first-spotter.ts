import { Op } from 'sequelize';
import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';

export class FirstSpotter {
    public static async isFirstModelInGuild(
        discordGuildId: string | null,
        brand: string,
        tradeName: string
    ): Promise<boolean> {
        if (!discordGuildId || !brand || !tradeName) {
            return false;
        }

        const unresolved = await Sighting.findOne({
            attributes: ['id'],
            where: { discordGuildId, vehicleId: null },
        });

        if (unresolved) {
            return false;
        }

        const vehicles = await Vehicle.findAll({
            attributes: ['license'],
            where: { brand, tradeName },
        });

        const licenses: string[] = [];
        for (const vehicle of vehicles) {
            licenses.push(vehicle.license);
        }

        if (!licenses.length) {
            return false;
        }

        const spotted = await Sighting.findOne({
            attributes: ['id'],
            where: {
                discordGuildId,
                license: { [Op.in]: licenses },
            },
        });

        return spotted === null;
    }
}
