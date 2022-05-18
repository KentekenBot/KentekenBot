import { OpenRdw } from "../services/open-rdw";
import { BaseModel } from "./base-model";

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

    public static async get(licence): Promise<VehicleInfo> {
        const rdw = new OpenRdw();
        const data = await rdw.getVehicleInfo(licence);

        return new VehicleInfo(data);
    }

    public getConstructionYear() {
        return this.datum_eerste_toelating.substr(0, 4);
    }

    public getPrice(): null|number {
        if (!this.catalogusprijs) {
            return null;
        }

        return parseInt(this.catalogusprijs);
    }
}
