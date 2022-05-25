import { Sighting } from '../models/sighting';
import { User } from 'discord.js';
import { DateTime } from '../util/date-time';

export class Sightings {
    public static async list(license: string, limit = 10): Promise<string | null> {
        const sightingData = await Sighting.findAndCountAll({
            limit,
            order: [['createdAt', 'DESC']],
            where: {
                license,
            },
        });

        if (sightingData.count === 0) {
            return null;
        }

        const sightings = sightingData.rows.map((sighting) => {
            return `<@${sighting.discordUserId}> - ${DateTime.getDiscordTimestamp(sighting.createdAt.getTime())}`;
        });

        const count = sightingData.count;
        if (count > limit) {
            sightings.push(`En ${count - 10} andere ${count - 10 == 1 ? 'keer' : 'keren'} gespot.`);
        }

        return sightings.join('\n');
    }

    public static insert(license: string, author: User): void {
        Sighting.create({
            license,
            discordUserId: author.id,
        });
    }
}
