import { AutocompleteInteraction, ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

export interface ICommand {
    init(message: ChatInputCommandInteraction, client: Client): ICommand;
    handle(): void | Promise<void>;

    register(builder: SlashCommandBuilder): SlashCommandBuilder;

    autocomplete?(interaction: AutocompleteInteraction): void | Promise<void>;
}
