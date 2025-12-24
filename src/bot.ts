import { Client, Interaction, MessageFlags } from 'discord.js';
import { Settings } from './services/settings';
import { AvailableSettings } from './enums/available-settings';
import { Output } from './services/output';
import { Heartbeat } from './services/heartbeat';
import { CommandCollection } from './services/command-collection';
import { Sightings } from './services/sightings';
import { SightingsView } from './util/sightings-view';

export class Bot {
    private client = new Client({
        intents: [],
    });

    public async liftOff(): Promise<void> {
        await Promise.all([this.login(), await CommandCollection.getInstance().register()]);

        this.startHeartbeat();

        this.client.on('clientReady', () => {
            Output.line(`Logged in as ${this.client.user?.tag}`);
            this.client.user?.setActivity(`/k <kenteken>`);
        });

        this.client.on('interactionCreate', async (interaction) => {
            this.handleInteraction(interaction);
        });
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

    private handleInteraction(interaction: Interaction): void {
        if (interaction.isChatInputCommand()) {
            this.handleCommand(interaction);
            return;
        }

        if (interaction.isButton()) {
            this.handleButton(interaction);
            return;
        }
    }

    private handleCommand(interaction: Interaction): void {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        const commands = CommandCollection.getInstance();

        const handlerClass = commands.getCommandHandler(interaction.commandName);
        if (!handlerClass) {
            interaction.reply('Oepsie woepsie, er is iets fout gegaan!');
            return;
        }

        new handlerClass().init(interaction, this.client).handle();
    }

    private async handleButton(interaction: Interaction): Promise<void> {
        if (!interaction.isButton()) {
            return;
        }

        const customId = interaction.customId;

        if (customId.startsWith('mijn-spots:') || customId.startsWith('server-spots:')) {
            await this.handleSpotsPageChange(interaction, customId);
        }
    }

    private async handleSpotsPageChange(interaction: Interaction, customId: string): Promise<void> {
        if (!interaction.isButton()) {
            return;
        }

        const parts = customId.split(':');
        const commandType = parts[0] as 'mijn-spots' | 'server-spots';
        const page = parseInt(parts[2], 10);

        if (isNaN(page)) {
            return;
        }

        await interaction.deferUpdate();

        const guildId = commandType === 'server-spots' ? interaction.guildId : null;
        const userId = commandType === 'mijn-spots' ? interaction.user.id : null;

        const result = await Sightings.getPaginated(page, guildId, userId);
        const components = SightingsView.build(result, commandType);

        await interaction.editReply({
            components,
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
