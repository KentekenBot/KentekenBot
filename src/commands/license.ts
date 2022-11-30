import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { VehicleInfo } from '../models/vehicle-info';
import { Str } from '../util/str';
import { License as LicenseUtil } from '../util/license';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { Sightings } from '../services/sightings';
import { FuelInfo } from '../models/fuel-info';
import { DateTime } from '../util/date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';

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

        const [vehicle, fuelInfo, sightings] = await Promise.all([
            VehicleInfo.get(license),
            FuelInfo.get(license),
            Sightings.list(license, this.message.guildId),
        ]);

        if (!vehicle) {
            this.reply('Ik kon dat kenteken niet vindn kerol');

            this.insertSighting(license);
            return;
        }

        const fuelDescription: string[] = [];
        fuelInfo.engines.forEach((engine) => {
            fuelDescription.push(engine.getHorsePowerDescription());
        });

        const meta = [
            `🎨 ${Str.toTitleCase(vehicle.eerste_kleur)}`,
            vehicle.getPriceDescription(),
            `🗓️ ${DateTime.getDiscordTimestamp(vehicle.getConstructionDateTimestamp(), DiscordTimestamps.SHORT_DATE)}`,
        ];

        const description = fuelDescription.join('  -  ') + '\n' + meta.join('  -  ');

        const response = new MessageEmbed()
            .setTitle(`${Str.toTitleCase(vehicle.merk)} ${Str.toTitleCase(vehicle.handelsbenaming)}`)
            .setDescription(description)
            .setThumbnail(`https://www.kentekencheck.nl/assets/img/brands/${Str.humanToSnakeCase(vehicle.merk)}.png`)
            .setFooter({ text: LicenseUtil.format(license) });

        if (sightings) {
            response.addField('Eerder gespot door', sightings);
        }

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

        this.insertSighting(license);
    }

    private insertSighting(license: string): void {
        Sightings.insert(license, this.message.author, this.message.guild, this.getComment());
    }

    private getComment(): string | null {
        const args = this.getArguments();
        args.shift();

        return args?.join(' ') || null;
    }
}
