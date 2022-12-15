import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { VehicleInfo } from '../models/vehicle-info';
import { Str } from '../util/str';
import { License as LicenseUtil } from '../util/license';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from 'discord.js';
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

        const response = new EmbedBuilder()
            .setTitle(`${Str.toTitleCase(vehicle.merk)} ${Str.toTitleCase(vehicle.handelsbenaming)}`)
            .setDescription(description)
            .setThumbnail(`https://www.kentekencheck.nl/assets/img/brands/${Str.humanToSnakeCase(vehicle.merk)}.png`)
            .setFooter({ text: LicenseUtil.format(license) });

        if (sightings) {
            response.addFields([{ name: 'Eerder gespot door:', value: sightings }]);
        }

        const links = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Kentekencheck')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://kentekencheck.nl/kenteken?i=${license}`),
            new ButtonBuilder()
                .setLabel('Finnik')
                .setStyle(ButtonStyle.Link)
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
