import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, User } from 'discord.js';
import { BoardView } from '../types/boards';
import { Leaderboard } from '../queries/leaderboard';
import { Superlatives } from '../queries/superlatives';
import { VehicleStats } from '../queries/vehicle-stats';
import { LeaderboardView } from '../util/leaderboard-view';
import { SuperlativesView } from '../util/superlatives-view';
import { StatsView } from '../util/stats-view';
import { BoardsView } from '../util/boards-view';

export interface BoardPayload {
    embeds: EmbedBuilder[];
    components: ActionRowBuilder<ButtonBuilder>[];
}

export class Boards {
    public static async render(view: BoardView, discordGuildId: string, user: User): Promise<BoardPayload> {
        const embed = await this.buildEmbed(view, discordGuildId, user);

        return {
            embeds: [embed],
            components: [BoardsView.buildTabs(view)],
        };
    }

    private static async buildEmbed(view: BoardView, discordGuildId: string, user: User): Promise<EmbedBuilder> {
        if (view === 'expensive') {
            const entries = await Superlatives.mostExpensive(discordGuildId);
            return SuperlativesView.build('💰 Duurste spots', entries, 'price');
        }

        if (view === 'oldest') {
            const entries = await Superlatives.oldest(discordGuildId);
            return SuperlativesView.build('🕰️ Oudste spots', entries, 'age');
        }

        if (view === 'mostSpotted') {
            const vehicles = await Leaderboard.getTopVehicles(discordGuildId);
            return BoardsView.buildMostSpotted(vehicles);
        }

        if (view === 'stats') {
            const profile = await VehicleStats.forUser(user.id);
            return StatsView.build(profile, user.displayName);
        }

        const result = await Leaderboard.forGuild(discordGuildId);
        return LeaderboardView.build(result);
    }
}
