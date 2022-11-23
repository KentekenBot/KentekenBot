import { BaseModel } from './base-model';
import { calculateHorsePower } from '../util/calulate-horse-power';

export class EngineInfo extends BaseModel {
    private nettomaximumvermogen: string | null = null;
    private netto_max_vermogen_elektrisch: string | null = null;
    public brandstof_omschrijving: string | null = null;

    public constructor(data: Record<string, unknown>) {
        super();
        this.hydrate(data);
    }

    public getHorsePower(): number | null {
        const power = this.getPower();
        return power ? calculateHorsePower(power) : null;
    }

    public getPower(): number | null {
        const power = this.nettomaximumvermogen ?? this.netto_max_vermogen_elektrisch;

        return power ? parseFloat(power) : null;
    }

    public getHorsePowerDescription(): string {
        const power = this.getHorsePower();
        if (!power) {
            return 'Onbekend vermogen';
        }

        return `${this.getEmoji()} ${power}PK`;
    }

    public getEmoji(): string {
        return this.brandstof_omschrijving === 'Elektriciteit' ? '⚡' : '⛽';
    }
}
