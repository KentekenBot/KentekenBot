import { Client, Message, GatewayIntentBits } from 'discord.js';
import { Settings } from './services/settings';
import { AvailableSettings } from './enums/available-settings';
import { Output } from './services/output';
import { License } from './commands/license';
import { Ping } from './commands/ping';
import { Status } from './commands/status';
import { CommandConstructor } from './interfaces/command-constructor';
import { Heartbeat } from './services/heartbeat';
export class Bot {
    private client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
    private commands?: Record<string, CommandConstructor>;

    public async liftOff(): Promise<void> {
        await this.login();

        this.startHeartbeat();

        this.client.on('ready', () => {
            Output.line(`Logged in as ${this.client.user?.tag}`);
            this.client.user?.setActivity(`${Settings.get(AvailableSettings.COMMAND_PREFIX)}k <kenteken>`);
        });

        this.commands = this.getCommands();

        this.client.on('messageCreate', (message) => {
            this.onMessageReceived(message);
        });
    }

    private startHeartbeat(): void {
        const heartbeatUrl = Settings.get(AvailableSettings.HEARTBEAT_URL);

        if (!heartbeatUrl) {
            return;
        }

        new Heartbeat(heartbeatUrl, 1000);
    }

    private login(): Promise<string> {
        return this.client.login(Settings.get(AvailableSettings.TOKEN));
    }

    private getCommands(): Record<string, CommandConstructor> {
        return {
            k: License,
            ping: Ping,
            status: Status,
        };
    }
    private onMessageReceived(message: Message): void {
        if (message.author.bot) {
            return;
        }

        if (!message.content.startsWith(Settings.get(AvailableSettings.COMMAND_PREFIX))) {
            return;
        }

        const usedCommand = message.content.replace(Settings.get(AvailableSettings.COMMAND_PREFIX), '').split(' ')[0];

        if (!this.commands?.hasOwnProperty(usedCommand)) {
            return;
        }

        const command = this.commands[usedCommand];
        new command(message, this.client).handle();
    }
}
