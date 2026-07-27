import { ContainerBuilder, TextDisplayBuilder } from 'discord.js';
import { RankedVehicle, SuperlativeMode } from '../types/superlatives';
import { Str } from './str';
import { License } from './license';
import { formatCurrency } from './format-currency';

export class SuperlativesView {
    private static readonly MEDALS = ['🥇', '🥈', '🥉'];

    public static build(title: string, entries: RankedVehicle[], mode: SuperlativeMode): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(0x5865f2);

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}`));

        if (entries.length === 0) {
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent('Er zijn nog geen voertuigen gespot in deze server.')
            );
            return [container];
        }

        const lines: string[] = [];
        entries.forEach((entry, index) => {
            lines.push(this.line(entry, index, mode));
        });

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')));

        return [container];
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
