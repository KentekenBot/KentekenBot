import { EmbedBuilder } from 'discord.js';
import { LeaderboardResult } from '../types/leaderboard';
import { Str } from './str';
import { License } from './license';

export class LeaderboardView {
    private static readonly MEDALS = ['🥇', '🥈', '🥉'];

    public static build(result: LeaderboardResult): EmbedBuilder {
        const embed = new EmbedBuilder().setColor(0x5865f2).setTitle('🏆 Server Leaderboard');

        if (result.spotters.length === 0) {
            embed.setDescription('Er zijn nog geen spots geregistreerd in deze server.');
            return embed;
        }

        embed.setDescription(this.buildRanking(result));

        if (result.topVehicle) {
            embed.addFields({ name: 'Meest gespot', value: this.buildTopVehicle(result) });
        }

        embed.setFooter({ text: `${result.totalSpots} spots in totaal` });

        return embed;
    }

    private static buildRanking(result: LeaderboardResult): string {
        const lines: string[] = [];

        result.spotters.forEach((spotter, index) => {
            const label = spotter.count === 1 ? 'spot' : 'spots';
            lines.push(`${this.rank(index)} <@${spotter.discordUserId}> — ${spotter.count} ${label}`);
        });

        return lines.join('\n');
    }

    private static buildTopVehicle(result: LeaderboardResult): string {
        const vehicle = result.topVehicle;
        if (!vehicle) {
            return '';
        }

        const formattedLicense = License.format(vehicle.license) || vehicle.license;

        if (vehicle.brand && vehicle.tradeName) {
            const name = `${Str.toTitleCase(vehicle.brand)} ${Str.toTitleCase(vehicle.tradeName)}`;
            return `**${name}** (\`${formattedLicense}\`) — ${vehicle.count} keer gespot`;
        }

        return `\`${formattedLicense}\` — ${vehicle.count} keer gespot`;
    }

    private static rank(index: number): string {
        return this.MEDALS[index] ?? `**${index + 1}.**`;
    }
}
