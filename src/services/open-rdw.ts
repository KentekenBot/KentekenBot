import axios from "axios";

export class OpenRdw {
    public async getVehicleInfo(licence: string): Promise<Record<string, unknown>|undefined> {
        const response = await axios.get(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${licence}`);
        return response.data[0]
    }

    public async getFuelInfo(licence: string): Promise<Record<string, unknown>> {
        const response = await axios.get(`https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=${licence}`);
        return response.data[0]
    }
}

