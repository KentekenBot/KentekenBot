import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { Leaderboard as LeaderboardQuery } from '../queries/leaderboard';
import { LeaderboardView } from '../util/leaderboard-view';

export class Leaderboard extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        return builder
            .setName('leaderboard')
            .setContexts(InteractionContextType.Guild)
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
            .setDescription('Bekijk de topspotters van deze server');
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const guildId = this.interaction.guildId;
        if (!guildId) {
            await this.interaction.followUp('Dit commando kan alleen in een server worden gebruikt.');
            return;
        }

        const result = await LeaderboardQuery.forGuild(guildId);
        const embed = LeaderboardView.build(result);

        await this.interaction.followUp({
            embeds: [embed],
            allowedMentions: { users: [] },
        });
    }
}
