import { Client, Interaction, MessageFlags } from 'discord.js';
import { Settings } from './services/settings';
import { AvailableSettings } from './enums/available-settings';
import { Output } from './services/output';
import { Heartbeat } from './services/heartbeat';
import { CommandCollection } from './services/command-collection';
import { Sightings } from './queries/sightings';
import { SightingsView } from './util/sightings-view';
import { Search } from './queries/search';
import { SearchModal } from './util/search-modal';
import { SearchView } from './util/search-view';
import { Boards } from './services/boards';
import { BoardsView } from './util/boards-view';
import { isBoardView } from './types/boards.types';

export class Bot {
    private client = new Client({
        intents: [],
    });

    public async liftOff(): Promise<void> {
        await Promise.all([this.login(), await CommandCollection.getInstance().register()]);

        this.client.on('clientReady', () => {
            Output.line(`Logged in as ${this.client.user?.tag}`);
            this.client.user?.setActivity(`/k <kenteken>`);
        });

        // Every interaction is awaited and caught here. Discord expires an
        // interaction token after a few seconds and supersedes an autocomplete on
        // every keystroke, so answering a dead interaction is a routine event rather
        // than an exception. Left unhandled, that rejection takes the process down.
        this.client.on('interactionCreate', (interaction) => {
            this.handleInteraction(interaction).catch(function (error: unknown) {
                Output.error(`Interaction ${interaction.id} failed`, error);
            });
        });

        // Started last: a broken heartbeat endpoint must never cost the bot its
        // interaction listeners.
        this.startHeartbeat();
    }

    private startHeartbeat(): void {
        const heartbeatUrl = Settings.get(AvailableSettings.HEARTBEAT_URL);

        if (!heartbeatUrl) {
            return;
        }

        new Heartbeat(heartbeatUrl, 1000 * 60);
    }

    private login(): Promise<string> {
        return this.client.login(Settings.get(AvailableSettings.TOKEN));
    }

    private async handleInteraction(interaction: Interaction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            await this.handleCommand(interaction);
            return;
        }

        if (interaction.isButton()) {
            await this.handleButton(interaction);
            return;
        }

        if (interaction.isAutocomplete()) {
            await this.handleAutocomplete(interaction);
            return;
        }

        if (interaction.isModalSubmit()) {
            await this.handleModal(interaction);
            return;
        }
    }

    private async handleAutocomplete(interaction: Interaction): Promise<void> {
        if (!interaction.isAutocomplete()) {
            return;
        }

        const handlerClass = CommandCollection.getInstance().getCommandHandler(interaction.commandName);
        if (!handlerClass) {
            return;
        }

        const handler = new handlerClass();
        if (handler.autocomplete) {
            await handler.autocomplete(interaction);
        }
    }

    private async handleCommand(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const commands = CommandCollection.getInstance();

        const handlerClass = commands.getCommandHandler(interaction.commandName);
        if (!handlerClass) {
            await interaction.reply('Oepsie woepsie, er is iets fout gegaan!');
            return;
        }

        await new handlerClass().init(interaction, this.client).handle();
    }

    private async handleButton(interaction: Interaction): Promise<void> {
        if (!interaction.isButton()) {
            return;
        }

        const customId = interaction.customId;

        if (customId.startsWith('userspots:') || customId.startsWith('serverspots:')) {
            await this.handleSpotsPageChange(interaction, customId);
            return;
        }

        if (customId.startsWith(SearchModal.BUTTON_PREFIX)) {
            await interaction.showModal(SearchModal.build(SearchModal.parseButtonId(customId)));
            return;
        }

        if (customId.startsWith(`${BoardsView.BUTTON_PREFIX}:`)) {
            await this.handleBoardChange(interaction, customId);
        }
    }

    private async handleBoardChange(interaction: Interaction, customId: string): Promise<void> {
        if (!interaction.isButton() || !interaction.guildId) {
            return;
        }

        const [, view, contextUserId] = customId.split(':');
        if (!isBoardView(view)) {
            return;
        }

        await interaction.deferUpdate();

        // Older messages carry no user id in the button; only then does the
        // presser become the subject of the boards.
        const user =
            contextUserId && contextUserId !== interaction.user.id
                ? await this.client.users.fetch(contextUserId)
                : interaction.user;

        const components = await Boards.render(view, interaction.guildId, user);

        await interaction.editReply({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });
    }

    private async handleModal(interaction: Interaction): Promise<void> {
        if (!interaction.isModalSubmit() || !interaction.customId.startsWith(SearchModal.MODAL_ID)) {
            return;
        }

        if (!interaction.isFromMessage()) {
            return;
        }

        await interaction.deferUpdate();

        const filters = SearchModal.fromSubmit(interaction);

        if (!Search.hasFilters(filters) || !interaction.guildId) {
            await interaction.editReply({
                components: SearchView.buildPrompt(filters),
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const result = await Search.inGuild(interaction.guildId, filters);

        await interaction.editReply({
            components: SearchView.build(result, filters),
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });
    }

    private async handleSpotsPageChange(interaction: Interaction, customId: string): Promise<void> {
        if (!interaction.isButton()) {
            return;
        }

        const parts = customId.split(':');
        const commandType = parts[0] as 'userspots' | 'serverspots';
        const page = parseInt(parts[2], 10);
        const contextUserId = parts[3];

        if (isNaN(page)) {
            return;
        }

        await interaction.deferUpdate();

        const guildId = commandType === 'serverspots' ? interaction.guildId : null;
        const userId = commandType === 'userspots' ? contextUserId : null;

        const result = await Sightings.getPaginated(page, guildId, userId);

        let displayName: string | undefined;
        if (commandType === 'userspots' && contextUserId) {
            const user = await this.client.users.fetch(contextUserId);
            displayName = user.displayName;
        }

        const components = SightingsView.build(result, commandType, contextUserId, displayName);

        await interaction.editReply({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });
    }
}
