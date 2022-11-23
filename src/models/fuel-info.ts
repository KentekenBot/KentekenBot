import { OpenRdw } from '../services/open-rdw';
import { EngineInfo } from './engine-info';

export class FuelInfo {
    public engines: EngineInfo[] = [];

    public static async get(license: string): Promise<FuelInfo> {
        const rdw = new OpenRdw();
        const data = await rdw.getFuelInfo(license);

        const info = new FuelInfo();

        data.forEach((engine) => {
            info.engines.push(new EngineInfo(engine));
        });

        return info;
    }
}
