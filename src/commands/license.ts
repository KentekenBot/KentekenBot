import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { VehicleInfo } from '../models/vehicle-info';
import { Str } from '../util/str';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { Sightings } from '../services/sightings';
import { FuelInfo } from '../models/fuel-info';

export class License extends BaseCommand implements ICommand {
    public async handle(): Promise<void> {
        const input = this.getArguments()[0];
        if (!input) {
            return;
        }

        const license = input.toUpperCase().split('-').join('');

        if (!this.getLicenseRegex().test(license)) {
            this.reply('Dat is geen kenteken kut');
            return;
        }

        const vehicle = await VehicleInfo.get(license);
        if (!vehicle) {
            this.reply('Ik kon dat kenteken niet vindn kerol');
            Sightings.insert(license, this.message.author.id);
            return;
        }

        const fuelInfo = await FuelInfo.get(license);

        const description = [
            Str.capitalizeWords(vehicle.eerste_kleur),
            `${fuelInfo.getHorsePower() ?? 'Onbekend'} pk`,
            vehicle.getPrice() ? `€${vehicle.getPrice()}` : 'Onbekende catalogusprijs',
            vehicle.getConstructionYear(),
        ];

        const response = new MessageEmbed()
            .setTitle(`${Str.capitalizeWords(vehicle.merk)} ${Str.capitalizeWords(vehicle.handelsbenaming)}`)
            .setURL(`https://kentekencheck.nl/kenteken?i=${license}`)
            .setDescription(description.join(' - '))
            .setFooter(license);

        const sightings = await Sightings.list(license);
        if (sightings) {
            response.addField('Eerder gespot door', sightings);
        }
        Sightings.insert(license, this.message.author.id);

        const links = new MessageActionRow()
            .addComponents(new MessageButton().setLabel('Kentekencheck').setStyle('LINK').setURL(`https://kentekencheck.nl/kenteken?i=${license}`));

        this.reply({embeds: [response], components:[links]});
    }

    private getLicenseRegex(): RegExp {
        return /^(([A-Z0-9]{2}-?[A-Z0-9]{2}-?[A-Z0-9]{2})|([0-9]{2}-?[A-Z]{3}-?[0-9])|([0-9]-?[A-Z]{3}-?[0-9]{2})|([A-Z]-?\d{3}-?[A-Z]{2})|([A-Z]{2}-?[0-9]{3}-?[A-Z]))$/;
    }
}
