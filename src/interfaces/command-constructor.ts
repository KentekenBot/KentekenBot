import { Client, Message } from 'discord.js';
import { ICommand } from './command';

export interface CommandConstructor {
    new (message: Message, client: Client): ICommand;
}
