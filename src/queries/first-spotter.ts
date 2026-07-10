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

        const count = await Sighting.count({
            where: { discordGuildId },
            include: [
                {
                    model: Vehicle,
                    as: 'vehicle',
                    required: true,
                    where: { brand, tradeName },
                },
            ],
        });

        return count === 0;
    }
}
