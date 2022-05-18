import { OpenRdw } from '../services/open-rdw';
import { BaseModel } from './base-model';

export class FuelInfo extends BaseModel {
    public nettomaximumvermogen = '';

    public constructor(data: Record<string, unknown>) {
        super();
        this.hydrate(data);
    }

    public static async get(licence: string): Promise<FuelInfo> {
        const rdw = new OpenRdw();
        const data = await rdw.getFuelInfo(licence);

        return new FuelInfo(data);
    }

    public getHorsePower(): number | null {
        if (!this.nettomaximumvermogen) {
            return null;
        }

        return Math.round(parseFloat(this.nettomaximumvermogen) * 1.362);
    }
}
