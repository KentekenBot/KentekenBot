import { ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from 'discord.js';
import { RandomSpot } from '../types/random-spot';
import { Str } from './str';
import { License } from './license';
import { DateTime } from './date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';

export class RandomSpotView {
    public static build(spot: RandomSpot): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(0x5865f2);

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🎲 Random spot'));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(this.title(spot)));

        const body = this.buildBody(spot);
        if (body.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(body.join('\n')));
        }

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(this.spotterLine(spot)));

        return [container];
    }

    private static title(spot: RandomSpot): string {
        const vehicle = spot.vehicle;
        const formattedLicense = License.format(spot.license) || spot.license;

        if (vehicle?.brand && vehicle?.tradeName) {
            const name = `${Str.toTitleCase(vehicle.brand)} ${Str.toTitleCase(vehicle.tradeName)}`;
            return `\`${formattedLicense}\` — **${name}**`;
        }

        return `\`${formattedLicense}\``;
    }

    private static buildBody(spot: RandomSpot): string[] {
        const vehicle = spot.vehicle;
        const body: string[] = [];

        const meta: string[] = [];
        if (vehicle?.color) {
            meta.push(`🎨 ${Str.toTitleCase(vehicle.color)}`);
        }
        if (vehicle?.totalHorsepower && vehicle.totalHorsepower !== '0') {
            const emoji = vehicle.primaryFuelType?.toLowerCase() === 'elektriciteit' ? '⚡' : '⛽';
            meta.push(`${emoji} ${vehicle.totalHorsepower}PK`);
        }
        if (meta.length > 0) {
            body.push(meta.join('  -  '));
        }

        if (spot.comment) {
            body.push(`💬 _${Str.limitCharacters(spot.comment, 200)}_`);
        }

        return body;
    }

    private static spotterLine(spot: RandomSpot): string {
        const timestamp = DateTime.getDiscordTimestamp(spot.createdAt.getTime(), DiscordTimestamps.RELATIVE);
        const spotter = `-# Gespot door <@${spot.discordUserId}>, ${timestamp}`;

        if (spot.discordChannelId && spot.discordInteractionId) {
            const link = `https://discord.com/channels/${spot.discordGuildId}/${spot.discordChannelId}/${spot.discordInteractionId}`;
            return `${spotter} · [bekijk spot](${link})`;
        }

        return spotter;
    }
}
