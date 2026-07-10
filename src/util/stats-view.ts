import { EmbedBuilder } from 'discord.js';
import { NamedVehicle, StatsProfile } from '../types/stats';
import { Str } from './str';
import { formatCurrency } from './format-currency';
import { DateTime } from './date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';

export class StatsView {
    public static build(profile: StatsProfile, displayName: string): EmbedBuilder {
        const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(`📊 ${displayName}'s stats`);

        if (profile.totalSpots === 0) {
            embed.setDescription('Nog geen spots. Gebruik `/k <kenteken>` om te beginnen!');
            return embed;
        }

        embed.addFields(
            { name: 'Spots', value: profile.totalSpots.toString(), inline: true },
            { name: 'Unieke kentekens', value: profile.uniquePlates.toString(), inline: true },
            { name: 'Brandstof', value: `⚡ ${profile.electricCount}  ·  ⛽ ${profile.fuelCount}`, inline: true }
        );

        if (profile.favoriteBrand) {
            const brand = Str.toTitleCase(profile.favoriteBrand.name);
            embed.addFields({
                name: 'Favoriet merk',
                value: `${brand} (${profile.favoriteBrand.count}x)`,
                inline: true,
            });
        }

        if (profile.mostExpensive) {
            embed.addFields({
                name: 'Duurste',
                value: `${this.vehicleName(profile.mostExpensive)} — ${formatCurrency(profile.mostExpensive.price)}`,
                inline: true,
            });
        }

        if (profile.oldest) {
            const year = profile.oldest.date.getFullYear();
            embed.addFields({
                name: 'Oudste',
                value: `${year} ${this.vehicleName(profile.oldest)}`,
                inline: true,
            });
        }

        if (profile.firstSpotAt) {
            const timestamp = DateTime.getDiscordTimestamp(profile.firstSpotAt.getTime(), DiscordTimestamps.RELATIVE);
            embed.addFields({ name: 'Eerste spot', value: timestamp });
        }

        return embed;
    }

    private static vehicleName(vehicle: NamedVehicle): string {
        if (vehicle.brand && vehicle.tradeName) {
            return `${Str.toTitleCase(vehicle.brand)} ${Str.toTitleCase(vehicle.tradeName)}`;
        }
        if (vehicle.brand) {
            return Str.toTitleCase(vehicle.brand);
        }
        return vehicle.license;
    }
}
