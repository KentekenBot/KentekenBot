import axios from "axios";
import { VehicleInfo } from "../models/vehicleInfo";

export class OpenRdw {
    public async getVehicleInfo(licence: string): Promise<Record<string, unknown>> {
        const repsonse = await axios.get(`https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=${licence}`);
        return repsonse.data[0]
    }
}

