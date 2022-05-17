import { Client } from "discord.js";
import { Settings } from "./services/settings";
import { AvailableSettings } from "./enums/available-settings";

export class Bot {
    private client: Client;

    public async liftOff(): Promise<void> {
        this.client = new Client();
        await this.login();
    }

    private login(): Promise<string> {
        return this.client.login(Settings.get(AvailableSettings.TOKEN));
    }
}
