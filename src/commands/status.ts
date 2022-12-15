import { EmbedBuilder } from 'discord.js';
import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import moment from 'moment';
import { uptime } from 'os';

export class Status extends BaseCommand implements ICommand {
    public handle(): void {
        const response = new EmbedBuilder().addFields(
            { name: 'Bot uptime', value: moment.duration(this.client.uptime).humanize() },
            { name: 'Server uptime', value: moment.duration(uptime(), 'seconds').humanize() },
            { name: 'Guild count', value: this.client.guilds.cache.size.toString() }
        );

        this.reply({ embeds: [response] });
    }
}
