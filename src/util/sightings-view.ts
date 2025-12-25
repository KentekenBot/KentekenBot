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
    public static build(result: PaginatedResult, commandType: 'userspots' | 'serverspots'): ContainerBuilder[] {
        const containers: ContainerBuilder[] = [];

        if (result.sightings.length === 0) {
            const emptyContainer = new ContainerBuilder()
                .setAccentColor(0x5865f2)
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('## Geen spots gevonden\nEr zijn nog geen spots geregistreerd.')
                );
            return [emptyContainer];
        }

        const headerContainer = new ContainerBuilder()
            .setAccentColor(0x5865f2)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    commandType === 'userspots'
                        ? `## 🚗 Jouw Spots\nJe hebt **${result.totalCount}** ${
                              result.totalCount === 1 ? 'voertuig' : 'voertuigen'
                          } gespot`
                        : `## 🚗 Server Spots\nDeze server heeft **${result.totalCount}** ${
                              result.totalCount === 1 ? 'spot' : 'spots'
                          }`
                )
            );

        if (result.totalPages > 1) {
            headerContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`Pagina ${result.currentPage} van ${result.totalPages}`)
            );
        }

        containers.push(headerContainer);

        for (const sighting of result.sightings) {
            const sightingContainer = this.buildSightingContainer(sighting, commandType);
            containers.push(sightingContainer);
        }

        if (result.totalPages > 1) {
            const paginationContainer = this.buildPaginationContainer(result, commandType);
            containers.push(paginationContainer);
        }

        return containers;
    }

    private static buildSightingContainer(
        sighting: PaginatedSighting,
        commandType: 'userspots' | 'serverspots'
    ): ContainerBuilder {
        const vehicle = sighting.vehicle;
        const container = new ContainerBuilder().setAccentColor(this.getColorForFuel(vehicle?.primaryFuelType));

        const title =
            vehicle?.brand && vehicle?.tradeName
                ? `### ${Str.toTitleCase(vehicle.brand)} ${Str.toTitleCase(vehicle.tradeName)}`
                : `### ${License.format(sighting.license)}`;

        const licensePlate = `**Kenteken:** ${License.format(sighting.license)}`;
        const timestamp = DateTime.getDiscordTimestamp(sighting.createdAt.getTime(), DiscordTimestamps.RELATIVE);

        const details: string[] = [title, licensePlate];

        if (vehicle) {
            if (vehicle.color) {
                details.push(`🎨 ${Str.toTitleCase(vehicle.color)}`);
            }
            if (vehicle.totalHorsepower) {
                const emoji = vehicle.primaryFuelType?.toLowerCase() === 'elektriciteit' ? '⚡' : '⛽';
                details.push(`${emoji} ${vehicle.totalHorsepower} PK`);
            }
        }

        if (commandType === 'serverspots') {
            details.push(`👤 <@${sighting.discordUserId}>`);
        }

        details.push(`🕐 ${timestamp}`);

        if (sighting.comment) {
            details.push(`💬 _${Str.limitCharacters(sighting.comment, 100)}_`);
        }

        if (sighting.discordChannelId && sighting.discordInteractionId) {
            details.push(
                `[Bekijk spot](https://discordapp.com/channels/${sighting.discordGuildId}/${sighting.discordChannelId}/${sighting.discordInteractionId})`
            );
        }

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(details.join('\n')));

        return container;
    }

    private static buildPaginationContainer(
        result: PaginatedResult,
        commandType: 'userspots' | 'serverspots'
    ): ContainerBuilder {
        const container = new ContainerBuilder();

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

        const buttons: ButtonBuilder[] = [];

        if (result.hasPreviousPage) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`${commandType}:prev:${result.currentPage - 1}`)
                    .setLabel('◀ Vorige')
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        if (result.hasNextPage) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`${commandType}:next:${result.currentPage + 1}`)
                    .setLabel('Volgende ▶')
                    .setStyle(ButtonStyle.Secondary)
            );
        }

        if (buttons.length > 0) {
            container.addActionRowComponents(new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons));
        }

        return container;
    }

    private static getColorForFuel(fuelType: string | null | undefined): number {
        if (!fuelType) return 0x808080;

        const fuel = fuelType.toLowerCase();
        if (fuel.includes('elektr')) return 0x00ff00;
        if (fuel.includes('diesel')) return 0x000000;
        if (fuel.includes('benzine')) return 0xff6600;
        if (fuel.includes('lpg')) return 0x0066ff;
        if (fuel.includes('waterstof')) return 0x00ccff;

        return 0x808080;
    }
}
