import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { VehicleInfo } from '../models/vehicle-info';
import { Str } from '../util/str';
import { License as LicenseUtil } from '../util/license';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { Sightings } from '../services/sightings';
import { FuelInfo } from '../models/fuel-info';
import { Sighting } from '../models/sighting';
import { DateTime } from '../util/date-time';

export class License extends BaseCommand implements ICommand {
    public async handle(): Promise<void> {
        const input = this.getArguments()[0];
        if (!input) {
            return;
        }

        const license = input.toUpperCase().split('-').join('');

        if (!LicenseUtil.isValid(license)) {
            this.reply('Dat is geen kenteken kut');
            return;
        }

        const vehicle = await VehicleInfo.get(license);
        if (!vehicle) {
            this.reply('Ik kon dat kenteken niet vindn kerol');

            Sightings.insert(license, this.message.author);
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
            .setDescription(description.join(' - '))
            .setThumbnail(`https://www.kentekencheck.nl/assets/img/brands/${Str.toSnakeCase(vehicle.merk)}.png`)
            .setFooter({ text: LicenseUtil.format(license) });

        const sightings = await Sightings.list(license);
        if (sightings) {
            response.addField('Eerder gespot door', sightings);
        }

        Sightings.insert(license, this.message.author);

        const links = new MessageActionRow().addComponents(
            new MessageButton()
                .setLabel('Kentekencheck')
                .setStyle('LINK')
                .setURL(`https://kentekencheck.nl/kenteken?i=${license}`),
            new MessageButton()
                .setLabel('Finnik')
                .setStyle('LINK')
                .setURL(`https://finnik.nl/kenteken/${license}/gratis`)
        );

        this.reply({ embeds: [response], components: [links] });
    }
}
