import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { VehicleInfo } from '../models/vehicle-info';
import { Str } from '../util/str';
import { License as LicenseUtil } from '../util/license';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import { Sightings } from '../services/sightings';
import { FuelInfo } from '../models/fuel-info';
import { DateTime } from '../util/date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';
import { calculateHorsePower } from '../util/calulate-horse-power';
import { StatensVegvesenFullData } from '../types/norwegian-statens-vegvesen';

export class License extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        builder
            .setName('k')
            .setDescription('Haal een kenteken op')
            .addStringOption((option) => option.setName('kenteken').setDescription('Het kenteken').setRequired(true))
            .addStringOption((option) =>
                option.setName('commentaar').setDescription('Voeg commentaar toe aan je spot')
            );

        return builder;
    }

    public async handle(): Promise<void> {
        const input = this.getArgument<string>('kenteken');
        if (!input) {
            return;
        }

        const license = input.toUpperCase().split('-').join('');

        if (LicenseUtil.isNorwegian(license)) {
            this.getNorwegianInfo(license);
            return;
        }

        if (!LicenseUtil.isValid(license)) {
            this.reply('Dat is geen kenteken kut');
            return;
        }

        const [vehicle, fuelInfo, sightings] = await Promise.all([
            VehicleInfo.get(license),
            FuelInfo.get(license),
            Sightings.list(license, this.interaction.guildId),
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
        Sightings.insert(license, this.interaction.user, this.interaction.guild, this.getComment());
    }

    private getComment(): string | null {
        return this.getArgument<string>('commentaar') || null;
    }

    protected async getNorwegianInfo(license: string) {
        const repsone = await fetch(
            `https://kjoretoyoppslag.atlas.vegvesen.no/ws/no/vegvesen/kjoretoy/kjoretoyoppslag/v1/oppslag/raw/${license}`
        );

        const data: StatensVegvesenFullData = await repsone.json();

        const brand = Str.toTitleCase(
            data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.generelt.merke[0].merke
        );
        const model = Str.toTitleCase(
            data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.generelt.handelsbetegnelse[0]
        );

        const engines = data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor;

        const fuelDescription: string[] = [];

        engines.forEach((engine) => {
            const emoji = engine.drivstoff[0].drivstoffKode.kodeNavn === 'Elektrisk' ? '⚡' : '⛽';

            fuelDescription.push(`${emoji} ${calculateHorsePower(engine.drivstoff[0].maksNettoEffekt)}PK`);
        });

        const meta = [
            `🗓️ ${DateTime.getDiscordTimestamp(
                new Date(data.kjoretoy.godkjenning.forstegangsGodkjenning.forstegangRegistrertDato).getTime(),
                DiscordTimestamps.SHORT_DATE
            )}`,
        ];

        const description = fuelDescription.join('  -  ') + '\n' + meta.join('  -  ');

        // forstegangRegistrertDato

        const response = new EmbedBuilder()
            .setTitle(`${Str.toTitleCase(brand)} ${Str.toTitleCase(model)}`)
            .setDescription(description)
            .setThumbnail(`https://www.kentekencheck.nl/assets/img/brands/${Str.humanToSnakeCase(brand)}.png`)
            .setFooter({ text: `🇳🇴 ${license}` });

        this.reply({ embeds: [response] });
    }
}
