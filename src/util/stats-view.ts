import { ContainerBuilder, SeparatorBuilder, SeparatorSpacingSize, TextDisplayBuilder } from 'discord.js';
import { NamedVehicle, StatsProfile } from '../types/stats';
import { Str } from './str';
import { formatCurrency } from './format-currency';
import { DateTime } from './date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';

export class StatsView {
    public static build(profile: StatsProfile, displayName: string): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(0x5865f2);

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 📊 ${displayName}'s stats`));

        if (profile.totalSpots === 0) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Nog geen spots. Gebruik `/k <kenteken>` om te beginnen!')
            );
            return [container];
        }

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));

        const counts = [
            `**Spots:** ${profile.totalSpots}`,
            `**Unieke kentekens:** ${profile.uniquePlates}`,
            `**Brandstof:** ⚡ ${profile.electricCount} · ⛽ ${profile.fuelCount}`,
        ];
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(counts.join('\n')));

        const highlights = this.buildHighlights(profile);
        if (highlights.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(highlights.join('\n')));
        }

        if (profile.firstSpotAt) {
            const timestamp = DateTime.getDiscordTimestamp(profile.firstSpotAt.getTime(), DiscordTimestamps.RELATIVE);
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Eerste spot ${timestamp}`));
        }

        return [container];
    }

    private static buildHighlights(profile: StatsProfile): string[] {
        const highlights: string[] = [];

        if (profile.favoriteBrand) {
            const brand = Str.toTitleCase(profile.favoriteBrand.name);
            highlights.push(`**Favoriet merk:** ${brand} (${profile.favoriteBrand.count}x)`);
        }

        if (profile.mostExpensive) {
            const price = formatCurrency(profile.mostExpensive.price);
            highlights.push(`**Duurste:** ${this.vehicleName(profile.mostExpensive)} — ${price}`);
        }

        if (profile.oldest) {
            const year = profile.oldest.date.getFullYear();
            highlights.push(`**Oudste:** ${year} ${this.vehicleName(profile.oldest)}`);
        }

        return highlights;
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
