import { OpenRdw } from "../services/open-rdw";

export class VehicleInfo {
    public kenteken: string = '';
    public voertuigsoort: string = '';
    public merk: string = '';
    public handelsbenaming: string = '';
    public datum_tenaamstelling: string = '';
    public inrichting: string = '';
    public eerste_kleur: string = '';
    public tweede_kleur: string = '';
    public aantal_cilinders: string = '';
    public massa_ledig_voertuig: string = '';
    public massa_rijklaar: string = '';
    public datum_eerste_toelating: string = '';
    public datum_eerste_tenaamstelling_in_nederland: string = '';
    public wacht_op_keuren: string = '';
    public wam_verzekerd: string = '';
    public aantal_deuren: string = '';
    public aantal_wielen: string = '';
    public afstand_hart_koppeling_tot_achterzijde_voertuig: string = '';
    public afstand_voorzijde_voertuig_tot_hart_koppeling: string = '';
    public lengte: string = '';
    public breedte: string = '';
    public europese_voertuigcategorie: string = '';
    public technische_max_massa_voertuig: string = '';
    public volgnummer_wijziging_eu_typegoedkeuring: string = '';
    public vermogen_massarijklaar: string = '';
    public wielbasis: string = '';
    public export_indicator: string = '';
    public openstaande_terugroepactie_indicator: string = '';
    public taxi_indicator: string = '';
    public maximum_massa_samenstelling: string = '';
    public jaar_laatste_registratie_tellerstand: string = '';
    public tellerstandoordeel: string = '';
    public code_toelichting_tellerstandoordeel: string = '';
    public tenaamstellen_mogelijk: string = '';
    public datum_tenaamstelling_dt: string = '';
    public datum_eerste_toelating_dt: string = '';
    public datum_eerste_tenaamstelling_in_nederland_dt: string = '';


    public constructor(data: Record<string, unknown>) {
        for (const key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }

        this.handelsbenaming = this.handelsbenaming.replace(this.merk, '');
    }

    public static async get(licence: string): Promise<VehicleInfo> {
        const rdw = new OpenRdw();
        const data = await rdw.getVehicleInfo(licence);

        return new VehicleInfo(data);
    }
}
