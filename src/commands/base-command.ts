import { Client, Message, MessageCreateOptions, MessagePayload } from 'discord.js';
import { Settings } from '../services/settings';
import { AvailableSettings } from '../enums/available-settings';

export abstract class BaseCommand {
    protected message: Message;
    protected client: Client;

    public constructor(message: Message, client: Client) {
        this.message = message;
        this.client = client;
    }

    protected getArguments(): string[] {
        const data = this.message.content.replace(Settings.get(AvailableSettings.COMMAND_PREFIX), '').split(' ');
        data.shift();

        return data;
    }

    protected reply(options: string | MessagePayload | MessageCreateOptions): void {
        this.message.channel.send(options);
    }
}
