import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { PaginatedResult, PaginatedSighting } from '../services/sightings';
import { DateTime } from './date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';
import { Str } from './str';
import { License } from './license';

export class SightingsView {
    public static build(
        result: PaginatedResult,
        commandType: 'userspots' | 'serverspots',
        contextUserId?: string,
        displayName?: string
    ): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(0x5865f2);

        if (result.sightings.length === 0) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('## Geen spots gevonden\nEr zijn nog geen spots geregistreerd.')
            );
            return [container];
        }

        const title =
            commandType === 'userspots'
                ? `## 🚗 ${displayName ? `${displayName}'s` : 'Jouw'} Spots`
                : '## 🚗 Server Spots';
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(title));

        for (let i = 0; i < result.sightings.length; i++) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            this.addSightingToContainer(container, result.sightings[i], commandType);
        }

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        this.addPaginationToContainer(container, result, commandType, contextUserId);

        return [container];
    }

    private static addSightingToContainer(
        container: ContainerBuilder,
        sighting: PaginatedSighting,
        commandType: 'userspots' | 'serverspots'
    ): void {
        const vehicle = sighting.vehicle;
        const formattedLicense = sighting.license ? License.format(sighting.license) : null;
        const brand = vehicle?.brand;
        const tradeName = vehicle?.tradeName;

        let title: string;
        if (formattedLicense && brand && tradeName) {
            title = `\`${formattedLicense}\` - **${Str.toTitleCase(brand)} ${Str.toTitleCase(tradeName)}**`;
        } else if (formattedLicense) {
            title = `\`${formattedLicense}\``;
        } else {
            title = '**Onbekend voertuig**';
        }

        const timestamp = DateTime.getDiscordTimestamp(sighting.createdAt.getTime(), DiscordTimestamps.RELATIVE);

        const meta: string[] = [];

        if (vehicle?.color) {
            meta.push(`🎨 ${Str.toTitleCase(vehicle.color)}`);
        }
        if (vehicle?.totalHorsepower && vehicle.totalHorsepower !== '0') {
            const emoji = vehicle.primaryFuelType?.toLowerCase() === 'elektriciteit' ? '⚡' : '⛽';
            meta.push(`${emoji} ${vehicle.totalHorsepower}PK`);
        }
        if (commandType === 'serverspots') {
            meta.push(`<@${sighting.discordUserId}>`);
        }

        if (sighting.discordChannelId && sighting.discordInteractionId) {
            meta.push(
                `[${timestamp}](https://discord.com/channels/${sighting.discordGuildId}/${sighting.discordChannelId}/${sighting.discordInteractionId})`
            );
        } else {
            meta.push(`${timestamp}`);
        }

        let content = `${title}\n${meta.join(' - ')}`;

        if (sighting.comment) {
            content += `\n💬 _${Str.limitCharacters(sighting.comment, 80)}_`;
        }

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
    }

    private static addPaginationToContainer(
        container: ContainerBuilder,
        result: PaginatedResult,
        commandType: 'userspots' | 'serverspots',
        contextUserId?: string
    ): void {
        const footerText =
            commandType === 'userspots'
                ? `${result.totalCount} ${result.totalCount === 1 ? 'voertuig gespot' : 'voertuigen gespot'}`
                : `${result.totalCount} ${
                      result.totalCount === 1 ? 'voertuig gespot' : 'voertuigen gespot'
                  } in deze server`;

        const pageInfo = result.totalPages > 1 ? ` · Pagina ${result.currentPage}/${result.totalPages}` : '';

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${footerText}${pageInfo}`));

        if (result.totalPages > 1) {
            const suffix = contextUserId ? `:${contextUserId}` : '';
            const buttons = [
                new ButtonBuilder()
                    .setCustomId(`${commandType}:first:1${suffix}`)
                    .setEmoji('⏮')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(result.currentPage === 1),
                new ButtonBuilder()
                    .setCustomId(`${commandType}:prev:${result.currentPage - 1}${suffix}`)
                    .setEmoji('◀')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!result.hasPreviousPage),
                new ButtonBuilder()
                    .setCustomId(`${commandType}:next:${result.currentPage + 1}${suffix}`)
                    .setEmoji('▶')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!result.hasNextPage),
                new ButtonBuilder()
                    .setCustomId(`${commandType}:last:${result.totalPages}${suffix}`)
                    .setEmoji('⏭')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(result.currentPage === result.totalPages),
            ];

            container.addActionRowComponents(new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons));
        }
    }
}
