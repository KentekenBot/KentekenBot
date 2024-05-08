import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { SlashCommandBuilder } from 'discord.js';

export class Ping extends BaseCommand implements ICommand {
    public handle(): void {
        this.reply('Pong');
    }

    register(builder: SlashCommandBuilder): SlashCommandBuilder {
        return builder.setName('ping').setDescription('pong');
    }
}
