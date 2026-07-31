import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { Boards } from '../services/boards';

export class Leaderboard extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        return builder
            .setName('leaderboard')
            .setContexts(InteractionContextType.Guild)
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
            .setDescription('Toplijsten van deze server: spotters, duurste, oudste en meer');
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const guildId = this.interaction.guildId;
        if (!guildId) {
            await this.interaction.followUp('Dit commando kan alleen in een server worden gebruikt.');
            return;
        }

        const components = await Boards.render('spotters', guildId, this.interaction.user);

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });
    }
}
