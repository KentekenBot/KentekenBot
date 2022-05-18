import axios from 'axios';
import { Settings } from './settings';
import { AvailableSettings } from '../enums/available-settings';

export class OpenRdw {
    public async getVehicleInfo(licence: string): Promise<Record<string, unknown> | undefined> {
        return await this.makeRequest(`m9d7-ebf2.json?kenteken=${licence}`);
    }
    public async getFuelInfo(licence: string): Promise<Record<string, unknown>> {
        return await this.makeRequest(`8ys7-d773.json?kenteken=${licence}`);
    }

    private async makeRequest(endpoint: string): Promise<Record<string, unknown>> {
        const response = await axios.get(`https://opendata.rdw.nl/resource/${endpoint}`, this.getRequestOptions());

        return response.data[0];
    }

    private getRequestOptions() {
        return {
            headers: {
                'X-App-Token': Settings.get(AvailableSettings.OPEN_DATA_TOKEN),
            },
        };
    }
}
