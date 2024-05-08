import { Client, CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface ICommand {
    init(message: CommandInteraction, client: Client): ICommand;
    handle(): void | Promise<void>;

    register(builder: SlashCommandBuilder): SlashCommandBuilder;
}
