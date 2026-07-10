import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { Superlatives } from '../queries/superlatives';
import { SuperlativesView } from '../util/superlatives-view';

export class Oldest extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        return builder
            .setName('oldest')
            .setContexts(InteractionContextType.Guild)
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
            .setDescription("De oudste auto's die in deze server zijn gespot");
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const guildId = this.interaction.guildId;
        if (!guildId) {
            await this.interaction.followUp('Dit commando kan alleen in een server worden gebruikt.');
            return;
        }

        const entries = await Superlatives.oldest(guildId);
        const embed = SuperlativesView.build('🕰️ Oudste spots', entries, 'age');

        await this.interaction.followUp({ embeds: [embed], allowedMentions: { users: [] } });
    }
}
