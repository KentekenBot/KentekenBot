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
        await this.interaction.deferReply();

        const user = this.interaction.user;
        const result = await Sightings.getPaginated(1, null, user.id);

        const components = SightingsView.build(result, 'userspots', user.id, user.displayName);

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
