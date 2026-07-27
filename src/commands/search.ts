import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { Search as SearchQuery } from '../queries/search';
import { SearchView } from '../util/search-view';
import { SearchFilters } from '../types/search';

export class Search extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        builder
            .setName('search')
            .setContexts(InteractionContextType.Guild)
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
            .setDescription('Zoek in de spots van deze server')
            .addStringOption((option) => option.setName('merk').setDescription('Filter op merk, bijv. Audi'))
            .addStringOption((option) => option.setName('kleur').setDescription('Filter op kleur, bijv. zwart'))
            .addStringOption((option) =>
                option.setName('brandstof').setDescription('Filter op brandstof, bijv. diesel')
            );

        return builder;
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const guildId = this.interaction.guildId;
        if (!guildId) {
            await this.interaction.followUp('Dit commando kan alleen in een server worden gebruikt.');
            return;
        }

        const filters = this.getFilters();

        if (!SearchQuery.hasFilters(filters)) {
            await this.interaction.followUp({
                components: SearchView.buildPrompt(filters),
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const result = await SearchQuery.inGuild(guildId, filters);

        await this.interaction.followUp({
            components: SearchView.build(result, filters),
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });
    }

    private getFilters(): SearchFilters {
        return {
            brand: this.getTrimmedArgument('merk'),
            color: this.getTrimmedArgument('kleur'),
            fuel: this.getTrimmedArgument('brandstof'),
        };
    }

    private getTrimmedArgument(name: string): string | undefined {
        const value = this.getArgument<string>(name)?.trim();
        return value ? value : undefined;
    }
}
