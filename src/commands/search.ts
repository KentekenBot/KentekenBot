import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { Search as SearchQuery } from '../queries/search';
import { SearchView } from '../util/search-view';
import { SearchFilters } from '../types/search.types';
import { SearchModal } from '../util/search-modal';
import { Str } from '../util/str';

export class Search extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        builder
            .setName('search')
            .setContexts(InteractionContextType.Guild)
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
            .setDescription('Zoek in de spots van deze server')
            // The lengths match the modal behind the Verfijnen button, which prefills
            // these values into inputs capped at the same length. Discord rejects a
            // modal whose value is longer than its input allows, and the button would
            // fail with nothing but "interactie mislukt" to show for it.
            .addStringOption((option) =>
                option.setName('merk').setDescription('Filter op merk, bijv. Audi').setMaxLength(SearchModal.MAX_LENGTH)
            )
            .addStringOption((option) =>
                option
                    .setName('kleur')
                    .setDescription('Filter op kleur, bijv. zwart')
                    .setMaxLength(SearchModal.MAX_LENGTH)
            )
            .addStringOption((option) =>
                option
                    .setName('brandstof')
                    .setDescription('Filter op brandstof, bijv. diesel')
                    .setMaxLength(SearchModal.MAX_LENGTH)
            )
            .addUserOption((option) => option.setName('spotter').setDescription('Filter op wie de spot heeft gedaan'));

        return builder;
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const guildId = this.interaction.guildId;
        if (!guildId) {
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
            spotterId: this.interaction.options.getUser('spotter')?.id,
        };
    }

    private getTrimmedArgument(name: string): string | undefined {
        const value = Str.withoutLikeWildcards(this.getArgument<string>(name) ?? '').trim();
        return value ? value : undefined;
    }
}
