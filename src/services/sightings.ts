import { Sighting } from '../models/sighting';
import { Guild, User, Util } from 'discord.js';
import { DateTime } from '../util/date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';
import { Str } from '../util/str';

export class Sightings {
    public static async list(license: string, discordGuildId: string | null, limit = 10): Promise<string | null> {
        let where = {};

        if (discordGuildId != null) {
            where = {
                license: license,
                discordGuildId: discordGuildId,
            };
        } else {
            where = {
                license: license,
            };
        }

        const sightingData = await Sighting.findAndCountAll({
            limit,
            order: [['createdAt', 'DESC']],
            where,
        });

        if (sightingData.count === 0) {
            return null;
        }

        const sightings = sightingData.rows.map((sighting) => {
            const text = [
                `<@${sighting.discordUserId}>`,
                DateTime.getDiscordTimestamp(sighting.createdAt.getTime(), DiscordTimestamps.RELATIVE),
            ];

            if (sighting.comment) {
                text.push(`_${Str.limitCharacters(sighting.comment, 100)}_`);
            }

            return text.join(' - ');
        });

        const count = sightingData.count;
        if (count > limit) {
            sightings.push(`En ${count - 10} andere ${count - 10 == 1 ? 'keer' : 'keren'} gespot.`);
        }

        return sightings.join('\n');
    }

    public static insert(license: string, author: User, guild: Guild | null, comment: null | string = null): void {
        Sighting.create({
            license,
            discordUserId: author.id,
            discordGuildId: guild?.id,
            comment: comment ? Str.limitCharacters(Util.escapeMarkdown(comment), 255) : null,
        });
    }
}
