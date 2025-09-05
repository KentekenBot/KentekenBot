import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';

export interface ICommand {
    init(message: ChatInputCommandInteraction, client: Client): ICommand;
    handle(): void | Promise<void>;

    register(builder: SlashCommandBuilder): SlashCommandBuilder;
}
