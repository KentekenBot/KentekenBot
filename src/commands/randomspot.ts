import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { RandomSpots } from '../queries/random-spot';
import { RandomSpotView } from '../util/random-spot-view';

export class RandomSpot extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        return builder
            .setName('randomspot')
            .setContexts(
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel
            )
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
            .setDescription('Haal een willekeurige eerdere spot op');
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const guildId = this.interaction.guildId;
        const userId = guildId ? null : this.interaction.user.id;

        const spot = await RandomSpots.get(guildId, userId);

        if (!spot) {
            await this.interaction.followUp('Er zijn nog geen spots om op te halen.');
            return;
        }

        const components = RandomSpotView.build(spot);

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });
    }
}
