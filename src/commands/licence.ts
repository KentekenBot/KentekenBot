import { ICommand } from "../interfaces/command";
import { BaseCommand } from "./base-command";
import { VehicleInfo } from "../models/vehicleInfo";
import { Str } from "../util/str";
import { MessageEmbed } from "discord.js";
import { Sightings } from "../services/sightings";
import { DateTime } from "../util/date-time";

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

        const vehicle = await VehicleInfo.get(licence)


        const response = new MessageEmbed()
            .setTitle(`${Str.capitalizeWords(vehicle.merk)} ${Str.capitalizeWords(vehicle.handelsbenaming)}`)
            .setURL(`https://kentekencheck.nl/kenteken?i=${licence}`)
            .setDescription(`${Str.capitalizeWords(vehicle.eerste_kleur)} - ${vehicle.getConstructionYear()}`)
            .setFooter(licence);


        const sightingData = await Sightings.get(licence);
        if (sightingData.length) {
            const sightings = []
            const sightingCount = sightingData[0].count as number

            sightingData.forEach((sighting) => {
                const dateTime = sighting.date_time;
                const sightingAt = DateTime.timeSince(new Date(parseInt(dateTime as string)))
                sightings.push(`<@${sighting.discord_user_id}> - ${sightingAt}`);
            });

            if (sightingData.length == 10 && sightingCount > 10) {
                sightings.push(`En ${sightingCount - 10} andere ${(sightingCount - 10) == 1 ? "keer" : "keren"} gespot.`);
            }

            response.addField('Eerder gespot door', sightings.join('\n'))
        }

        Sightings.insert(licence, this.message.author.id)

        this.reply(response);
    }
}
