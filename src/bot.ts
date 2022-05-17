import { Client, Message } from "discord.js";
import { Settings } from "./services/settings";
import { AvailableSettings } from "./enums/available-settings";
import { Output } from "./services/output";
import { ICommand } from "./interfaces/command";
import { Licence } from "./commands/licence";

export class Bot {
    private client: Client;
    private commands: Record<string, ICommand>

    public async liftOff(): Promise<void> {
        this.client = new Client();
        await this.login();

        this.client.on('ready', () => {
            Output.line(`Logged in as ${this.client.user.tag}`);
            this.client.user.setActivity(`${Settings.get(AvailableSettings.COMMAND_PREFIX)}k <kenteken>`);
        });

        this.commands = this.getCommands();

        this.client.on('message', (message) => {
            this.onMessageReceived(message)
        });
    }

    private login(): Promise<string> {
        return this.client.login(Settings.get(AvailableSettings.TOKEN));
    }

    private getCommands(): Record<string, ICommand> {
        return {
            'k': Licence
        }
    }


    private onMessageReceived(message: Message): void {
        if (message.author.bot) {
            return;
        }

        if (!message.content.startsWith(Settings.get(AvailableSettings.COMMAND_PREFIX))) {
            return;
        }

        const usedCommand = message.content.replace(Settings.get(AvailableSettings.COMMAND_PREFIX), '').split(' ')[0]

        if (!this.commands.hasOwnProperty(usedCommand)) {
            message.channel.send('Dat commando bestaat toch niet jonge')
        }

        const command = (new Licence(message, this.client)).handle();
    }


}
