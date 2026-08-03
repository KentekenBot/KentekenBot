import { AttachmentBuilder, ContainerBuilder } from 'discord.js';
import { VehicleInfo } from '../models/vehicle-info';
import { FuelInfo } from '../models/fuel-info';
import { BrandLogoResult } from './brand-logo.types';
import { SightingsSummary } from './sighting.types';

export interface LicenseViewMessage {
    components: ContainerBuilder[];
    files: AttachmentBuilder[];
}

export interface LicenseViewData {
    vehicleInfo: VehicleInfo;
    fuelInfo: FuelInfo;
    formattedLicense: string;
    vehicleType: string | null;
    badge: string | null;
    comment: string | null;
    sightings: SightingsSummary | null;
    logo: BrandLogoResult;
}

export interface NorwegianViewData {
    license: string;
    brand: string;
    model: string;
    fuelDescription: string;
    registeredTimestamp: number;
    logo: BrandLogoResult;
}
