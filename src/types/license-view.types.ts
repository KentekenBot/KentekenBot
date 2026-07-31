import { AttachmentBuilder, ContainerBuilder } from 'discord.js';
import { VehicleInfo } from '../models/vehicle-info';
import { FuelInfo } from '../models/fuel-info';
import { BrandLogoResult } from './brand-logo.types';

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
    sightingsList: string | null;
    spotCount: number | null;
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
