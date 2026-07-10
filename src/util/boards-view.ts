import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { BoardView } from '../types/boards';
import { MostSpottedVehicle } from '../types/leaderboard';
import { Str } from './str';
import { License } from './license';

export class BoardsView {
    public static readonly BUTTON_PREFIX = 'leaderboard';

    private static readonly TABS: { view: BoardView; label: string; emoji: string }[] = [
        { view: 'spotters', label: 'Topspotters', emoji: '🏆' },
        { view: 'expensive', label: 'Duurste', emoji: '💰' },
        { view: 'oldest', label: 'Oudste', emoji: '🕰️' },
        { view: 'mostSpotted', label: 'Meest gespot', emoji: '🚗' },
        { view: 'stats', label: 'Mijn stats', emoji: '📊' },
    ];

    public static buildTabs(active: BoardView): ActionRowBuilder<ButtonBuilder> {
        const row = new ActionRowBuilder<ButtonBuilder>();

        for (const tab of this.TABS) {
            const isActive = tab.view === active;

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`${this.BUTTON_PREFIX}:${tab.view}`)
                    .setLabel(tab.label)
                    .setEmoji(tab.emoji)
                    .setStyle(isActive ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setDisabled(isActive)
            );
        }

        return row;
    }

    public static buildMostSpotted(vehicles: MostSpottedVehicle[]): EmbedBuilder {
        const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('🚗 Meest gespot');

        if (vehicles.length === 0) {
            embed.setDescription('Er zijn nog geen spots geregistreerd in deze server.');
            return embed;
        }

        const lines: string[] = [];
        vehicles.forEach((vehicle, index) => {
            lines.push(this.mostSpottedLine(vehicle, index));
        });

        embed.setDescription(lines.join('\n'));

        return embed;
    }

    private static mostSpottedLine(vehicle: MostSpottedVehicle, index: number): string {
        const formattedLicense = License.format(vehicle.license) || vehicle.license;

        let name: string;
        if (vehicle.brand && vehicle.tradeName) {
            name = `**${Str.toTitleCase(vehicle.brand)} ${Str.toTitleCase(
                vehicle.tradeName
            )}** (\`${formattedLicense}\`)`;
        } else {
            name = `\`${formattedLicense}\``;
        }

        return `**${index + 1}.** ${name} — ${vehicle.count}× · laatst door <@${vehicle.lastSpotterUserId}>`;
    }
}
