import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { escapeMarkdown, Guild, User } from 'discord.js';
import { DateTime } from '../util/date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';
import { Str } from '../util/str';

export interface PaginatedSighting {
    id: number;
    license: string;
    comment: string | null;
    createdAt: Date;
    discordUserId: string;
    discordGuildId: string;
    discordChannelId: string;
    discordInteractionId: string;
    vehicle: {
        brand: string | null;
        tradeName: string | null;
        color: string | null;
        totalHorsepower: string | null;
        primaryFuelType: string | null;
        country: string;
    } | null;
}

export interface PaginatedResult {
    sightings: PaginatedSighting[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

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

        const sightings: PaginatedSighting[] = rows.map((row) => {
            const vehicle = row.vehicle;
            return {
                id: row.id,
                license: row.license,
                comment: row.comment,
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
                          country: vehicle.country,
                      }
                    : null,
            };
        });

        return {
            sightings,
            totalCount: count,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        };
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
        guild: Guild | null,
        comment: null | string = null,
        vehicleId: number | null
    ): void {
        Sighting.create({
            license,
            discordUserId: author.id,
            discordGuildId: guild?.id,
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
