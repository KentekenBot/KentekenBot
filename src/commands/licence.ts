import { ICommand } from "../interfaces/command";
import { BaseCommand } from "./base-command";
import { VehicleInfo } from "../models/vehicle-info";
import { Str } from "../util/str";
import { MessageEmbed } from "discord.js";
import { Sightings } from "../services/sightings";
import { DateTime } from "../util/date-time";
import { FuelInfo } from "../models/fuel-info";

export class Licence extends BaseCommand implements ICommand {
    public async handle(): Promise<void> {
        const input = this.getArguments()[0];
        if (!input) {
            return;
        }

        const licence = input.toUpperCase().split('-').join('');
        const regex = /^(([A-Z0-9]{2}-?[A-Z0-9]{2}-?[A-Z0-9]{2})|([0-9]{2}-?[A-Z]{3}-?[0-9])|([0-9]-?[A-Z]{3}-?[0-9]{2})|([A-Z]-?\d{3}-?[A-Z]{2})|([A-Z]{2}-?[0-9]{3}-?[A-Z]))$/;

        if (!regex.test(licence)) {
            this.reply('Dat is geen kenteken kut');
            return
        }


        const vehicle = await VehicleInfo.get(licence);
        if (!vehicle) {
            this.reply('Ik kon dat kenteken niet vindn kerol');
            Sightings.insert(licence, this.message.author.id)
            return;
        }

        const fuelInfo = await FuelInfo.get(licence);

        const description = [
            Str.capitalizeWords(vehicle.eerste_kleur),
            `${fuelInfo.getHorsePower() ?? 'Onbekend'} pk`,
            vehicle.getPrice() ? `€${vehicle.getPrice()}` : 'Onbekende catalogusprijs',
            vehicle.getConstructionYear()
        ]

        const response = new MessageEmbed()
            .setTitle(`${Str.capitalizeWords(vehicle.merk)} ${Str.capitalizeWords(vehicle.handelsbenaming)}`)
            .setURL(`https://kentekencheck.nl/kenteken?i=${licence}`)
            .setDescription(description.join(' - '))
            .setFooter(licence);

        const sightings = await Sightings.list(licence);
        if (sightings) {
            response.addField('Eerder gespot door', sightings);
        }

        Sightings.insert(licence, this.message.author.id)

        this.reply(response);
    }
}
