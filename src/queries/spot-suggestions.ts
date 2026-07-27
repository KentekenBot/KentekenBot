import { Op, WhereOptions } from 'sequelize';
import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { SpotSuggestion } from '../util/spot-suggestion';
import { SpotChoice } from '../types/spot-choice';

export class SpotSuggestions {
    private static readonly MAX_CHOICES = 25;
    private static readonly SCAN_LIMIT = 100;

    public static async forUser(discordUserId: string, query: string): Promise<SpotChoice[]> {
        const normalized = SpotSuggestion.normalizeQuery(query);

        const where: WhereOptions = normalized
            ? { discordUserId, license: { [Op.like]: `%${normalized}%` } }
            : { discordUserId };

        const sightings = await Sighting.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: this.SCAN_LIMIT,
            include: [
                {
                    model: Vehicle,
                    as: 'vehicle',
                    required: false,
                },
            ],
        });

        const seen = new Set<string>();
        const choices: SpotChoice[] = [];

        for (const sighting of sightings) {
            if (seen.has(sighting.license)) {
                continue;
            }
            seen.add(sighting.license);

            const vehicle = sighting.vehicle;
            choices.push({
                name: SpotSuggestion.label(sighting.license, vehicle?.brand ?? null, vehicle?.tradeName ?? null),
                value: sighting.license,
            });

            if (choices.length >= this.MAX_CHOICES) {
                break;
            }
        }

        return choices;
    }
}
