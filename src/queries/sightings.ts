import { Sighting } from '../models/sighting';
import { Vehicle } from '../models/vehicle';
import { escapeMarkdown, User } from 'discord.js';
import { Str } from '../util/str';
import {
    PaginatedResult,
    PaginatedSighting,
    PaginatedVehicle,
    SightingsSpotter,
    SightingsSummary,
} from '../types/sighting.types';

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

    // A summary instead of a row per sighting: a car spotted forty times produced
    // forty near-identical lines, which pushed the rest of the reply off screen. The
    // rows are read in full because the counts are per spotter.
    public static async summary(
        license: string,
        discordGuildId: string | null,
        discordUserId: string
    ): Promise<SightingsSummary | null> {
        const where = discordGuildId != null ? { license, discordGuildId } : { license, discordUserId };

        const rows = await Sighting.findAll({
            where,
            order: [['createdAt', 'DESC']],
        });

        if (rows.length === 0) {
            return null;
        }

        // The rows come in newest first, so the first row seen for a spotter is
        // their most recent sighting.
        const bySpotter = new Map<string, SightingsSpotter>();
        let needsUpdate = false;

        for (const row of rows) {
            const spotter = bySpotter.get(row.discordUserId);
            if (spotter) {
                spotter.count += 1;
            } else {
                bySpotter.set(row.discordUserId, {
                    discordUserId: row.discordUserId,
                    count: 1,
                    lastSightingAt: row.createdAt.getTime(),
                    lastSightingUrl: this.sightingUrl(row),
                });
            }

            if (row.vehicleId === null) {
                needsUpdate = true;
            }
        }

        const spotters = [...bySpotter.values()];

        spotters.sort(function (first: SightingsSpotter, second: SightingsSpotter): number {
            return second.count - first.count;
        });

        const newest = rows[0];

        return {
            total: rows.length,
            spotters,
            lastComment: newest.comment ? Str.limitCharacters(newest.comment, 100) : null,
            needsUpdate,
        };
    }

    private static sightingUrl(sighting: Sighting): string | null {
        if (!sighting.discordGuildId || !sighting.discordChannelId || !sighting.discordInteractionId) {
            return null;
        }

        return `https://discordapp.com/channels/${sighting.discordGuildId}/${sighting.discordChannelId}/${sighting.discordInteractionId}`;
    }

    // Returns the stored row: the first-spotter check has to be able to leave this
    // sighting out of its own comparison.
    public static insert(
        license: string,
        author: User,
        interactionId: string,
        channelId: string | null,
        discordGuildId: string | null,
        comment: null | string = null,
        vehicleId: number | null
    ): Promise<Sighting> {
        return Sighting.create({
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
