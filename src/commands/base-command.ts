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

    protected getArguments(): string[] {
        // console.log(this.interaction.options.get());
        return [];
        // const data = this.interaction.content.replace(Settings.get(AvailableSettings.COMMAND_PREFIX), '').split(' ');
        // data.shift();
        //
        // return data;
    }

    protected reply(options: string | MessagePayload | InteractionReplyOptions): void {
        this.interaction?.reply(options);
    }
}
