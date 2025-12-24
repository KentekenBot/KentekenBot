import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { Sightings } from '../services/sightings';
import { SightingsView } from '../util/sightings-view';

export class ServerSpots extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        builder
            .setName('server-spots')
            .setContexts(InteractionContextType.Guild)
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
            .setDescription('Bekijk alle spots van deze server');

        return builder;
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const guildId = this.interaction.guildId;
        if (!guildId) {
            await this.interaction.followUp('Dit commando kan alleen in een server worden gebruikt.');
            return;
        }

        const result = await Sightings.getPaginated(1, guildId, null);

        const components = SightingsView.build(result, 'server-spots');

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
