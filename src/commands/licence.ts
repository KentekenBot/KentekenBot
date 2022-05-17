import { ICommand } from "../interfaces/command";
import { BaseCommand } from "./base-command";

export class Licence extends BaseCommand implements ICommand {
    public name = 'k';
}
