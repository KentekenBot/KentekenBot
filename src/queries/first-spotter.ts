import { Op, WhereOptions } from 'sequelize';
import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';

export class FirstSpotter {
    // The match runs on licenses rather than on vehicleId, so a sighting counts as
    // long as its plate is known in Vehicles. Guilds used to be excluded entirely
    // when any sighting still had vehicleId NULL, which meant the badge never fired
    // again once a guild had one legacy plate: those rows are matched up front by
    // the backfill migration instead.
    //
    // A plate that has never been looked up since the Vehicles table was added is
    // still unknown, so a guild can in theory be told it is seeing a model for the
    // first time when a legacy sighting of it exists. The badge is a nicety, and
    // that is a better trade than never awarding it at all.
    public static async isFirstModelInGuild(
        discordGuildId: string | null,
        brand: string,
        tradeName: string,
        excludeSightingId: number | null = null
    ): Promise<boolean> {
        if (!discordGuildId || !brand || !tradeName) {
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

        // The sighting being answered is written before this check, so that two
        // people spotting the same new model at once cannot both be told they were
        // first. It has to be left out of its own comparison.
        const where: WhereOptions = {
            discordGuildId,
            license: { [Op.in]: licenses },
        };

        if (excludeSightingId !== null) {
            where.id = { [Op.ne]: excludeSightingId };
        }

        const spotted = await Sighting.findOne({ attributes: ['id'], where });

        return spotted === null;
    }
}
