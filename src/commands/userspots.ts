import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { Sightings } from '../services/sightings';
import { SightingsView } from '../util/sightings-view';

export class UserSpots extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        builder
            .setName('userspots')
            .setContexts(
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel
            )
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
            .setDescription('Bekijk al jouw spots');

        return builder;
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply({ ephemeral: true });

        const result = await Sightings.getPaginated(1, null, this.interaction.user.id);

        const components = SightingsView.build(result, 'userspots');

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
