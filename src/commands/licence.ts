import { ICommand } from "../interfaces/command";
import { BaseCommand } from "./base-command";
import { OpenRdw } from "../services/open-rdw";
import { VehicleInfo } from "../models/vehicleInfo";
import { Str } from "../util/str";

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

        this.reply(`${Str.capitalizeWords(vehicle.merk)} ${Str.capitalizeWords(vehicle.handelsbenaming)}`);
    }
}
