import { VehicleInfo } from '../models/vehicle-info';
import { FuelInfo } from '../models/fuel-info';

export interface LicenseViewData {
    vehicleInfo: VehicleInfo;
    fuelInfo: FuelInfo;
    formattedLicense: string;
    vehicleType: string | null;
    badge: string | null;
    comment: string | null;
    sightingsList: string | null;
    spotCount: number | null;
}

export interface NorwegianViewData {
    license: string;
    brand: string;
    model: string;
    fuelDescription: string;
    registeredTimestamp: number;
}
