import { ICommand } from "../interfaces/command";
import { BaseCommand } from "./base-command";

export class Ping extends BaseCommand implements ICommand{
    public handle(): void {
        this.reply('Pong')
    }
}
