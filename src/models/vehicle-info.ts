import { OpenRdw } from '../services/open-rdw';
import { BaseModel } from './base-model';
import { formatCurrency } from '../util/format-currency';

export class VehicleInfo extends BaseModel {
    public kenteken = '';
    public voertuigsoort = '';
    public merk = '';
    public handelsbenaming = '';
    public datum_tenaamstelling = '';
    public inrichting = '';
    public eerste_kleur = '';
    public tweede_kleur = '';
    public aantal_cilinders = '';
    public massa_ledig_voertuig = '';
    public massa_rijklaar = '';
    public datum_eerste_toelating = '';
    public datum_eerste_tenaamstelling_in_nederland = '';
    public wacht_op_keuren = '';
    public wam_verzekerd = '';
    public aantal_deuren = '';
    public aantal_wielen = '';
    public afstand_hart_koppeling_tot_achterzijde_voertuig = '';
    public afstand_voorzijde_voertuig_tot_hart_koppeling = '';
    public lengte = '';
    public breedte = '';
    public europese_voertuigcategorie = '';
    public technische_max_massa_voertuig = '';
    public volgnummer_wijziging_eu_typegoedkeuring = '';
    public vermogen_massarijklaar = '';
    public wielbasis = '';
    public export_indicator = '';
    public openstaande_terugroepactie_indicator = '';
    public taxi_indicator = '';
    public maximum_massa_samenstelling = '';
    public jaar_laatste_registratie_tellerstand = '';
    public tellerstandoordeel = '';
    public code_toelichting_tellerstandoordeel = '';
    public tenaamstellen_mogelijk = '';
    public datum_tenaamstelling_dt = '';
    public datum_eerste_toelating_dt = '';
    public datum_eerste_tenaamstelling_in_nederland_dt = '';
    public catalogusprijs = '';

    public constructor(data: Record<string, unknown>) {
        super();
        this.hydrate(data);

        this.handelsbenaming = this.handelsbenaming.replace(this.merk, '');
    }

    public static async get(license: string): Promise<VehicleInfo | null> {
        const rdw = new OpenRdw();
        const data = await rdw.getVehicleInfo(license);

        return data && data[0] ? new VehicleInfo(data[0]) : null;
    }

    public getConstructionYear() {
        return parseInt(this.datum_eerste_toelating.substring(0, 4));
    }

    public getConstructionMonth() {
        return parseInt(this.datum_eerste_toelating.substring(4, 6));
    }

    public getConstructionDay() {
        return parseInt(this.datum_eerste_toelating.substring(6, 8));
    }

    public getConstructionDateTimestamp() {
        return new Date(
            this.getConstructionYear(),
            this.getConstructionMonth() - 1,
            this.getConstructionDay()
        ).getTime();
    }

    public getPrice(): null | number {
        return this.catalogusprijs ? parseInt(this.catalogusprijs) : null;
    }

    public getPriceDescription(): string {
        const price = this.getPrice();
        if (!price) {
            return '💵 Onbekende catalogusprijs';
        }

        return `💵 ${formatCurrency(price)}`;
    }
}
