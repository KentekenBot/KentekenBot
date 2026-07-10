import { EmbedBuilder } from 'discord.js';
import { RandomSpot } from '../types/random-spot';
import { Str } from './str';
import { License } from './license';
import { DateTime } from './date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';

export class RandomSpotView {
    public static build(spot: RandomSpot): EmbedBuilder {
        const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('🎲 Random spot');

        const vehicle = spot.vehicle;
        const formattedLicense = License.format(spot.license) || spot.license;

        if (vehicle?.brand && vehicle?.tradeName) {
            const name = `${Str.toTitleCase(vehicle.brand)} ${Str.toTitleCase(vehicle.tradeName)}`;
            embed.setDescription(`\`${formattedLicense}\` — **${name}**`);
        } else {
            embed.setDescription(`\`${formattedLicense}\``);
        }

        const meta: string[] = [];
        if (vehicle?.color) {
            meta.push(`🎨 ${Str.toTitleCase(vehicle.color)}`);
        }
        if (vehicle?.totalHorsepower && vehicle.totalHorsepower !== '0') {
            const emoji = vehicle.primaryFuelType?.toLowerCase() === 'elektriciteit' ? '⚡' : '⛽';
            meta.push(`${emoji} ${vehicle.totalHorsepower}PK`);
        }
        if (meta.length > 0) {
            embed.addFields({ name: 'Voertuig', value: meta.join('  -  ') });
        }

        const timestamp = DateTime.getDiscordTimestamp(spot.createdAt.getTime(), DiscordTimestamps.RELATIVE);
        const spotter = `Gespot door <@${spot.discordUserId}>, ${timestamp}`;

        if (spot.discordChannelId && spot.discordInteractionId) {
            const link = `https://discord.com/channels/${spot.discordGuildId}/${spot.discordChannelId}/${spot.discordInteractionId}`;
            embed.addFields({ name: '​', value: `${spotter} · [bekijk spot](${link})` });
        } else {
            embed.addFields({ name: '​', value: spotter });
        }

        if (spot.comment) {
            embed.addFields({ name: 'Commentaar', value: Str.limitCharacters(spot.comment, 200) });
        }

        return embed;
    }
}
