import axios from 'axios';
import { Settings } from './settings';
import { AvailableSettings } from '../enums/available-settings';

export class OpenRdw {
    public async getVehicleInfo(license: string): Promise<Record<string, unknown>[] | undefined> {
        return await this.makeRequest(`m9d7-ebf2.json?kenteken=${license}`);
    }
    public async getFuelInfo(license: string): Promise<Record<string, unknown>[]> {
        return await this.makeRequest(`8ys7-d773.json?kenteken=${license}`);
    }

    private async makeRequest(endpoint: string): Promise<Record<string, unknown>[]> {
        const response = await axios.get(`https://opendata.rdw.nl/resource/${endpoint}`, this.getRequestOptions());

        return response.data;
    }

    private getRequestOptions() {
        const token = Settings.get(AvailableSettings.OPEN_DATA_TOKEN);
        const headers: Record<string, string> = {};

        if (token) {
            headers['X-App-Token'] = token;
        }

        return { headers };
    }
}
