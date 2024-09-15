import { Vehicle } from '../models';
import { VehicleInfo } from '../models/vehicle-info';
import { FuelInfo } from '../models/fuel-info';

export class Vehicles {
    public static async insert(vehicle: VehicleInfo, fuelInfo: FuelInfo): Promise<number> {
        const existingVehicle = await Vehicle.findOne({
            where: { license: vehicle.kenteken },
        });

        if (existingVehicle) {
            return existingVehicle.id;
        } else {
            const totalHorsepower = fuelInfo.engines.reduce((total, engine) => {
                const hp = engine.getHorsePower();
                return hp ? total + hp : total;
            }, 0);

            const fuelTypes = fuelInfo.engines
                .map((engine) => engine.brandstof_omschrijving)
                .filter((value, index, self) => value !== null && self.indexOf(value) === index);

            const newVehicle = await Vehicle.create({
                dateFirstAllowed: new Date(vehicle.getConstructionDateTimestamp()),
                dateFirstRegistration: vehicle.datum_eerste_tenaamstelling_in_nederland_dt
                    ? new Date(vehicle.datum_eerste_tenaamstelling_in_nederland_dt)
                    : null,
                license: vehicle.kenteken,
                brand: vehicle.merk,
                tradeName: vehicle.handelsbenaming,
                price: vehicle.getPrice(),
                vehicleType: vehicle.voertuigsoort,
                interiorType: vehicle.inrichting,
                color: vehicle.eerste_kleur,
                totalHorsepower: totalHorsepower.toString(),
                primaryFuelType: fuelTypes[0] || null,
                secondaryFuelType: fuelTypes[1] || null,
            });

            return newVehicle.id;
        }
    }
}
