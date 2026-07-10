import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import {
    SlashCommandBuilder,
    InteractionContextType,
    ApplicationIntegrationType,
    User,
    MessageFlags,
} from 'discord.js';
import { VehicleStats } from '../queries/vehicle-stats';
import { StatsView } from '../util/stats-view';

export class Stats extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        builder
            .setName('stats')
            .setContexts(
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel
            )
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
            .setDescription('Bekijk jouw spot-statistieken')
            .addUserOption((option) =>
                option.setName('gebruiker').setDescription('Bekijk de statistieken van een andere gebruiker')
            );

        return builder;
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const target = this.getTargetUser();
        const profile = await VehicleStats.forUser(target.id);
        const components = StatsView.build(profile, target.displayName);

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
        });
    }

    private getTargetUser(): User {
        return this.interaction.options.getUser('gebruiker') ?? this.interaction.user;
    }
}
