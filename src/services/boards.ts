import { ContainerBuilder, User } from 'discord.js';
import { BoardView } from '../types/boards';
import { Leaderboard } from '../queries/leaderboard';
import { Superlatives } from '../queries/superlatives';
import { VehicleStats } from '../queries/vehicle-stats';
import { LeaderboardView } from '../util/leaderboard-view';
import { SuperlativesView } from '../util/superlatives-view';
import { StatsView } from '../util/stats-view';
import { BoardsView } from '../util/boards-view';

export class Boards {
    public static async render(view: BoardView, discordGuildId: string, user: User): Promise<ContainerBuilder[]> {
        const containers = await this.buildContainers(view, discordGuildId, user);

        return BoardsView.attachTabs(containers, view);
    }

    private static async buildContainers(
        view: BoardView,
        discordGuildId: string,
        user: User
    ): Promise<ContainerBuilder[]> {
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
