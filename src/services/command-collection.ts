import { CommandConstructor } from '../interfaces/command-constructor';
import { License } from '../commands/license';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { AvailableSettings } from '../enums/available-settings';
import { Settings } from './settings';
import { Ping } from '../commands/ping';
import { Status } from '../commands/status';

export class CommandCollection {
    private static instance: CommandCollection;
    private commands: { builder: SlashCommandBuilder; command: CommandConstructor }[] = [];

    private constructor() {
        // silence is golden
    }

    private getCommandClasses(): CommandConstructor[] {
        return [License, Ping, Status];
    }

    private getCommands(): { builder: SlashCommandBuilder; command: CommandConstructor }[] {
        if (this.commands.length) {
            return this.commands;
        }

        this.getCommandClasses().forEach((command) => {
            const commandHandler = new command();
            const builder = commandHandler.register(new SlashCommandBuilder());

            if (!this.isValidCommand(builder)) {
                return;
            }

            this.commands.push({ command, builder });
        });

        return this.commands;
    }

    public async register(): Promise<void> {
        const body: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];
        this.getCommands().forEach((command) => body.push(command.builder.toJSON()));

        const rest = new REST({ version: '10' }).setToken(Settings.get(AvailableSettings.TOKEN));
        await rest.put(Routes.applicationCommands(Settings.get(AvailableSettings.CLIENT_ID)), { body });
    }

    public getCommandHandler(name: string): CommandConstructor | undefined {
        return this.getCommands().find((command) => command.builder.name === name)?.command || undefined;
    }

    public static getInstance(): CommandCollection {
        if (!CommandCollection.instance) {
            CommandCollection.instance = new CommandCollection();
        }

        return CommandCollection.instance;
    }

    private isValidCommand(builder: SlashCommandBuilder): boolean {
        if (!builder.name) {
            throw new Error('Cannot register command without name');
        }

        if (!builder.description) {
            throw new Error('Cannot register command without name');
        }

        return true;
    }
}
