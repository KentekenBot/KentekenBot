import { EmbedBuilder } from 'discord.js';
import { SearchFilters, SearchResult, SearchSighting } from '../types/search';
import { Str } from './str';
import { License } from './license';
import { DateTime } from './date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';

export class SearchView {
    public static build(result: SearchResult, filters: SearchFilters): EmbedBuilder {
        const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('🔎 Zoekresultaten');

        if (result.sightings.length === 0) {
            embed.setDescription(`Geen spots gevonden voor ${this.filterSummary(filters)}.`);
            return embed;
        }

        const lines: string[] = [];
        for (const sighting of result.sightings) {
            lines.push(this.line(sighting));
        }

        embed.setDescription(lines.join('\n'));
        embed.setFooter({ text: this.footer(result, filters) });

        return embed;
    }

    public static filterSummary(filters: SearchFilters): string {
        const parts: string[] = [];

        if (filters.brand) {
            parts.push(`merk "${filters.brand}"`);
        }
        if (filters.color) {
            parts.push(`kleur "${filters.color}"`);
        }
        if (filters.fuel) {
            parts.push(`brandstof "${filters.fuel}"`);
        }

        return parts.join(', ');
    }

    private static line(sighting: SearchSighting): string {
        const vehicle = sighting.vehicle;
        const formattedLicense = License.format(sighting.license) || sighting.license;

        let title: string;
        if (vehicle?.brand && vehicle?.tradeName) {
            title = `\`${formattedLicense}\` **${Str.toTitleCase(vehicle.brand)} ${Str.toTitleCase(
                vehicle.tradeName
            )}**`;
        } else {
            title = `\`${formattedLicense}\``;
        }

        const meta: string[] = [];
        if (vehicle?.color) {
            meta.push(`🎨 ${Str.toTitleCase(vehicle.color)}`);
        }
        if (vehicle?.totalHorsepower && vehicle.totalHorsepower !== '0') {
            const emoji = vehicle.primaryFuelType?.toLowerCase() === 'elektriciteit' ? '⚡' : '⛽';
            meta.push(`${emoji} ${vehicle.totalHorsepower}PK`);
        }
        meta.push(`<@${sighting.discordUserId}>`);

        const timestamp = DateTime.getDiscordTimestamp(sighting.createdAt.getTime(), DiscordTimestamps.RELATIVE);
        if (sighting.discordChannelId && sighting.discordInteractionId) {
            const link = `https://discord.com/channels/${sighting.discordGuildId}/${sighting.discordChannelId}/${sighting.discordInteractionId}`;
            meta.push(`[${timestamp}](${link})`);
        } else {
            meta.push(timestamp);
        }

        return `${title}\n${meta.join(' · ')}`;
    }

    private static footer(result: SearchResult, filters: SearchFilters): string {
        const summary = this.filterSummary(filters);
        const base = `${result.totalCount} ${result.totalCount === 1 ? 'resultaat' : 'resultaten'} · ${summary}`;

        if (result.totalCount > result.shown) {
            return `${base} · eerste ${result.shown} getoond`;
        }

        return base;
    }
}
