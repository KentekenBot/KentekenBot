import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { escapeMarkdown, User } from 'discord.js';
import { DateTime } from '../util/date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';
import { Str } from '../util/str';
import { PaginatedResult, PaginatedSighting, PaginatedVehicle } from '../types/sighting.types';

export class Sightings {
    private static readonly ITEMS_PER_PAGE = 6;

    public static async getPaginated(
        page: number,
        discordGuildId: string | null,
        discordUserId: string | null
    ): Promise<PaginatedResult> {
        const where: Record<string, string> = {};

        if (discordGuildId) {
            where.discordGuildId = discordGuildId;
        }

        if (discordUserId) {
            where.discordUserId = discordUserId;
        }

        const offset = (page - 1) * this.ITEMS_PER_PAGE;

        const { count, rows } = await Sighting.findAndCountAll({
            where,
            limit: this.ITEMS_PER_PAGE,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Vehicle,
                    as: 'vehicle',
                    required: false,
                },
            ],
        });

        const totalPages = Math.ceil(count / this.ITEMS_PER_PAGE);

        const sightings: PaginatedSighting[] = [];
        for (const row of rows) {
            sightings.push(this.toPaginatedSighting(row));
        }

        return {
            sightings,
            totalCount: count,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
    }

    private static toPaginatedSighting(sighting: Sighting): PaginatedSighting {
        const {
            id,
            license,
            comment,
            createdAt,
            discordUserId,
            discordGuildId,
            discordChannelId,
            discordInteractionId,
            vehicle,
        } = sighting;

        return {
            id,
            license,
            comment,
            createdAt,
            discordUserId,
            discordGuildId,
            discordChannelId,
            discordInteractionId,
            vehicle: vehicle ? this.toPaginatedVehicle(vehicle) : null,
        };
    }

    private static toPaginatedVehicle(vehicle: Vehicle): PaginatedVehicle {
        const { brand, tradeName, color, totalHorsepower, primaryFuelType, country } = vehicle;

        return { brand, tradeName, color, totalHorsepower, primaryFuelType, country };
    }

    public static async countForLicense(license: string, discordGuildId: string | null): Promise<number | null> {
        if (!discordGuildId) {
            return null;
        }

        return Sighting.count({ where: { license, discordGuildId } });
    }

    public static async list(
        license: string,
        discordGuildId: string | null,
        discordUserId: string,
        limit = 10
    ): Promise<{ list: string; needsUpdate: boolean } | null> {
        let where;

        if (discordGuildId != null) {
            where = {
                license: license,
                discordGuildId: discordGuildId,
            };
        } else {
            where = {
                license: license,
                discordUserId: discordUserId,
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

        const needsUpdate = sightingData.rows.some((sighting) => sighting.vehicleId === null);

        const sightings = sightingData.rows.map((sighting) => {
            const text = [`<@${sighting.discordUserId}>`];

            const timestampText = DateTime.getDiscordTimestamp(
                sighting.createdAt.getTime(),
                DiscordTimestamps.RELATIVE
            );
            if (sighting.discordChannelId && sighting.discordInteractionId) {
                text.push(
                    `[${timestampText}](https://discordapp.com/channels/${sighting.discordGuildId}/${sighting.discordChannelId}/${sighting.discordInteractionId})`
                );
            } else {
                text.push(timestampText);
            }

            if (sighting.comment) {
                text.push(`_${Str.limitCharacters(sighting.comment, 100)}_`);
            }

            return text.join(' - ');
        });

        const count = sightingData.count;
        if (count > limit) {
            sightings.push(`En ${count - 10} andere ${count - 10 == 1 ? 'keer' : 'keren'} gespot.`);
        }

        return {
            list: sightings.join('\n'),
            needsUpdate,
        };
    }

    public static insert(
        license: string,
        author: User,
        interactionId: string,
        channelId: string | null,
        discordGuildId: string | null,
        comment: null | string = null,
        vehicleId: number | null
    ): void {
        Sighting.create({
            license,
            discordUserId: author.id,
            discordGuildId: discordGuildId ?? undefined,
            discordChannelId: channelId ?? undefined,
            discordInteractionId: interactionId,
            comment: comment ? Str.limitCharacters(escapeMarkdown(comment), 255) : null,
            vehicleId: vehicleId ?? null,
        });
    }

    public static async updateVehicleIdForLicense(license: string, vehicleId: number): Promise<void> {
        await Sighting.update(
            { vehicleId },
            {
                where: {
                    license,
                    vehicleId: null,
                },
            }
        );
    }
}
