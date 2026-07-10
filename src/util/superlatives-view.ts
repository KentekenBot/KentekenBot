import { EmbedBuilder } from 'discord.js';
import { RankedVehicle, SuperlativeMode } from '../types/superlatives';
import { Str } from './str';
import { License } from './license';
import { formatCurrency } from './format-currency';

export class SuperlativesView {
    private static readonly MEDALS = ['🥇', '🥈', '🥉'];

    public static build(title: string, entries: RankedVehicle[], mode: SuperlativeMode): EmbedBuilder {
        const embed = new EmbedBuilder().setColor(0x5865f2).setTitle(title);

        if (entries.length === 0) {
            embed.setDescription('Er zijn nog geen voertuigen gespot in deze server.');
            return embed;
        }

        const lines: string[] = [];
        entries.forEach((entry, index) => {
            lines.push(this.line(entry, index, mode));
        });

        embed.setDescription(lines.join('\n'));

        return embed;
    }

    private static line(entry: RankedVehicle, index: number, mode: SuperlativeMode): string {
        const name = this.vehicleName(entry);
        const value = mode === 'price' ? this.priceValue(entry) : this.ageValue(entry);

        return `${this.rank(index)} **${name}** — ${value} · <@${entry.spotterUserId}>`;
    }

    private static priceValue(entry: RankedVehicle): string {
        return entry.price !== null ? formatCurrency(entry.price) : 'onbekend';
    }

    private static ageValue(entry: RankedVehicle): string {
        return entry.dateFirstAllowed ? entry.dateFirstAllowed.getFullYear().toString() : 'onbekend';
    }

    private static vehicleName(entry: RankedVehicle): string {
        const formattedLicense = License.format(entry.license) || entry.license;

        if (entry.brand && entry.tradeName) {
            return `${Str.toTitleCase(entry.brand)} ${Str.toTitleCase(entry.tradeName)}`;
        }
        if (entry.brand) {
            return Str.toTitleCase(entry.brand);
        }

        return formattedLicense;
    }

    private static rank(index: number): string {
        return this.MEDALS[index] ?? `**${index + 1}.**`;
    }
}
