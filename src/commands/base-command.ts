import { Client, CommandInteraction, InteractionReplyOptions, MessagePayload } from 'discord.js';

export abstract class BaseCommand {
    protected interaction!: CommandInteraction;
    protected client!: Client;

    public init(interaction: CommandInteraction, client: Client): this {
        this.interaction = interaction;
        this.client = client;

        return this;
    }

    protected getArgument<T>(name: string): T | undefined {
        return (this.interaction?.options.get(name)?.value as unknown as T) || undefined;
    }

    protected reply(options: string | MessagePayload | InteractionReplyOptions): void {
        this.interaction?.reply(options);
    }
}
