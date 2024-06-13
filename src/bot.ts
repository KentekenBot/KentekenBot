import { Client, Interaction } from 'discord.js';
import { Settings } from './services/settings';
import { AvailableSettings } from './enums/available-settings';
import { Output } from './services/output';
import { Heartbeat } from './services/heartbeat';
import { CommandCollection } from './services/command-collection';

export class Bot {
    private client = new Client();

    public async liftOff(): Promise<void> {
        await Promise.all([this.login(), await CommandCollection.getInstance().register()]);

        this.startHeartbeat();

        this.client.on('ready', () => {
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
        if (!interaction.isCommand()) {
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
}
