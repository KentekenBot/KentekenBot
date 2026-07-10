import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { VehicleInfo } from '../models/vehicle-info';
import { License as LicenseUtil } from '../util/license';
import { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } from 'discord.js';
import { Sightings } from '../services/sightings';
import { FuelInfo } from '../models/fuel-info';
import { calculateHorsePower } from '../util/calulate-horse-power';
import { StatensVegvesenFullData } from '../types/norwegian-statens-vegvesen';
import { Vehicles } from '../services/vehicles';
import { Vehicle } from '../models';
import { FirstSpotter } from '../queries/first-spotter';
import { FirstSpotBadge } from '../util/first-spot-badge';
import { LicenseView } from '../util/license-view';

export class License extends BaseCommand implements ICommand {
    public register(builder: SlashCommandBuilder): SlashCommandBuilder {
        builder
            .setName('k')
            .setContexts(
                InteractionContextType.Guild,
                InteractionContextType.BotDM,
                InteractionContextType.PrivateChannel
            )
            .setIntegrationTypes(ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall)
            .setDescription('Haal een kenteken op')
            .addStringOption((option) => option.setName('kenteken').setDescription('Het kenteken').setRequired(true))
            .addStringOption((option) =>
                option.setName('commentaar').setDescription('Voeg commentaar toe aan je spot')
            );

        return builder;
    }

    public async handle(): Promise<void> {
        await this.interaction.deferReply();

        const input = this.getArgument<string>('kenteken');
        if (!input) {
            return;
        }

        const license = input.toUpperCase().split('-').join('');

        if (LicenseUtil.isNorwegian(license)) {
            await this.getNorwegianInfo(license);
            return;
        }

        if (!LicenseUtil.isValid(license)) {
            await this.interaction.followUp('Dat is geen kenteken kut');
            return;
        }

        const [vehicleInfo, fuelInfo, sightings, previousSpotCount] = await Promise.all([
            VehicleInfo.get(license),
            FuelInfo.get(license),
            Sightings.list(license, this.interaction.guildId, this.interaction.user.id),
            Sightings.countForLicense(license, this.interaction.guildId),
        ]);

        if (!vehicleInfo) {
            if (sightings) {
                await this.interaction.followUp({
                    components: LicenseView.buildNotFound(license, LicenseUtil.format(license), sightings.list),
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: { users: [] },
                });
            } else {
                this.interaction.followUp('Ik kon dat kenteken niet vindn kerol');
            }
            return;
        }

        const isFirstModel = await FirstSpotter.isFirstModelInGuild(
            this.interaction.guildId,
            vehicleInfo.merk,
            vehicleInfo.handelsbenaming
        );

        const components = LicenseView.build({
            vehicleInfo,
            fuelInfo,
            formattedLicense: LicenseUtil.format(license),
            vehicleType: LicenseUtil.getVehicleType(license),
            badge: isFirstModel ? FirstSpotBadge.message(vehicleInfo.merk, vehicleInfo.handelsbenaming) : null,
            comment: this.getComment(),
            sightingsList: sightings ? sightings.list : null,
            spotCount: previousSpotCount !== null ? previousSpotCount + 1 : null,
        });

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });

        const vehicle = await this.insertVehicle(vehicleInfo, fuelInfo, 'nl');

        this.insertSighting(license, vehicle.id);

        if (sightings?.needsUpdate) {
            Sightings.updateVehicleIdForLicense(license, vehicle.id);
        }
    }

    private async insertSighting(license: string, vehicleId: number): Promise<void> {
        await Sightings.insert(
            license,
            this.interaction.user,
            this.interaction.id,
            this.interaction.channelId,
            this.interaction.guildId,
            this.getComment(),
            vehicleId
        );
    }

    private async insertVehicle(vehicle: VehicleInfo, fuelInfo: FuelInfo, country: string): Promise<Vehicle> {
        return Vehicles.insert(vehicle, fuelInfo, country);
    }

    private getComment(): string | null {
        return this.getArgument<string>('commentaar') || null;
    }

    protected async getNorwegianInfo(license: string) {
        const response = await fetch(
            `https://kjoretoyoppslag.atlas.vegvesen.no/ws/no/vegvesen/kjoretoy/kjoretoyoppslag/v1/oppslag/raw/${license}`
        );

        const data: StatensVegvesenFullData = await response.json();

        const brand = data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.generelt.merke[0]?.merke ?? '';
        const model = data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.generelt.handelsbetegnelse[0] ?? '';

        const engines = data.kjoretoy.godkjenning.tekniskGodkjenning.tekniskeData.motorOgDrivverk.motor;

        const fuelDescription: string[] = [];
        engines.forEach((engine) => {
            const fuel = engine.drivstoff[0];
            if (!fuel?.maksNettoEffekt) {
                return;
            }

            const emoji = fuel.drivstoffKode.kodeNavn === 'Elektrisk' ? '⚡' : '⛽';
            fuelDescription.push(`${emoji} ${calculateHorsePower(fuel.maksNettoEffekt)}PK`);
        });

        const registeredTimestamp = new Date(
            data.kjoretoy.godkjenning.forstegangsGodkjenning.forstegangRegistrertDato
        ).getTime();

        const components = LicenseView.buildNorwegian({
            license,
            brand,
            model,
            fuelDescription: fuelDescription.join('  ·  '),
            registeredTimestamp: isNaN(registeredTimestamp) ? 0 : registeredTimestamp,
        });

        await this.interaction.followUp({
            components,
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
