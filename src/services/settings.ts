import { AvailableSettings } from '../enums/available-settings'
import { existsSync, readFile, readFileSync } from 'fs';

export class Settings {
    private static settings: Record<AvailableSettings, string>;

    public static get(key: AvailableSettings): string {
        if (!this.settings) {
            this.settings = this.getSettingFromFile();
        }

        return this.settings[key];
    }

    private static getSettingFromFile() {
        if (!existsSync(__dirname + '/../../settings.json')) {
            throw new Error('Settings file does not exist');
        }

        const file = readFileSync(__dirname + '/../../settings.json');
        return JSON.parse(file.toString());
    }
}
