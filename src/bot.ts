import { Client, Constructable, Intents, Message } from 'discord.js';
import { Settings } from './services/settings';
import { AvailableSettings } from './enums/available-settings';
import { Output } from './services/output';
import { License } from './commands/license';
import { Ping } from './commands/ping';
import { CommandConstructor } from './interfaces/command-constructor';

export class Bot {
    private client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
    private commands?: Record<string, CommandConstructor>;

    public async liftOff(): Promise<void> {
        await this.login();

        this.client.on('ready', () => {
            Output.line(`Logged in as ${this.client.user?.tag}`);
            this.client.user?.setActivity(`${Settings.get(AvailableSettings.COMMAND_PREFIX)}k <kenteken>`);
        });

        this.commands = this.getCommands();

        this.client.on('messageCreate', (message) => {
            this.onMessageReceived(message);
        });
    }

    private login(): Promise<string> {
        return this.client.login(Settings.get(AvailableSettings.TOKEN));
    }

    private getCommands(): Record<string, CommandConstructor> {
        return {
            k: License,
            ping: Ping,
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
            message.channel.send('Dat commando bestaat toch niet jonge');
            return;
        }

        const command = this.commands[usedCommand];
        new command(message, this.client).handle();
    }
}
