import { ICommand } from '../interfaces/command';
import { BaseCommand } from './base-command';
import { VehicleInfo } from '../models/vehicle-info';
import { License as LicenseUtil } from '../util/license';
import {
    SlashCommandBuilder,
    InteractionContextType,
    ApplicationIntegrationType,
    AutocompleteInteraction,
    MessageFlags,
} from 'discord.js';
import { SpotSuggestions } from '../queries/spot-suggestions';
import { Sightings } from '../queries/sightings';
import { FuelInfo } from '../models/fuel-info';
import { calculateHorsePower } from '../util/calulate-horse-power';
import { StatensVegvesenFullData } from '../types/norwegian-statens-vegvesen.types';
import { Vehicles } from '../queries/vehicles';
import { FirstSpotter } from '../queries/first-spotter';
import { FirstSpotBadge } from '../util/first-spot-badge';
import { LicenseView } from '../util/license-view';
import { BrandLogo } from '../util/brand-logo';
import { Output } from '../services/output';
import { Marktplaats } from '../services/marktplaats';
import { ForSale } from '../util/for-sale';

interface RecordedSpot {
    vehicleId: number | null;
    sightingId: number | null;
}

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
            .addStringOption((option) =>
                option.setName('kenteken').setDescription('Het kenteken').setRequired(true).setAutocomplete(true)
            )
            .addStringOption((option) =>
                option.setName('commentaar').setDescription('Voeg commentaar toe aan je spot')
            );

        return builder;
    }

    public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const focused = interaction.options.getFocused();
        const choices = await SpotSuggestions.forUser(interaction.user.id, focused);

        await interaction.respond(choices);
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

        const [vehicleInfo, fuelInfo, sightings, forSaleCandidates] = await Promise.all([
            VehicleInfo.get(license),
            FuelInfo.get(license),
            Sightings.summary(license, this.interaction.guildId, this.interaction.user.id),
            new Marktplaats().findCandidates(license),
        ]);

        if (!vehicleInfo) {
            if (sightings) {
                await this.interaction.followUp({
                    components: LicenseView.buildNotFound(license, LicenseUtil.format(license), sightings),
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: { users: [] },
                });
            } else {
                this.interaction.followUp('Ik kon dat kenteken niet vindn kerol');
            }
            return;
        }

        const recorded = await this.recordSpot(license, vehicleInfo, fuelInfo);

        const isFirstModel = await this.isFirstModel(vehicleInfo, recorded.sightingId);

        const forSale = ForSale.verify(forSaleCandidates, vehicleInfo.merk);

        const { components, files } = LicenseView.build({
            vehicleInfo,
            fuelInfo,
            formattedLicense: LicenseUtil.format(license),
            vehicleType: LicenseUtil.getVehicleType(license),
            badge: isFirstModel ? FirstSpotBadge.message(vehicleInfo.merk, vehicleInfo.handelsbenaming) : null,
            forSale,
            comment: this.getComment(),
            sightings,
            logo: await BrandLogo.resolve(vehicleInfo.merk),
        });

        await this.interaction.followUp({
            components,
            files,
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { users: [] },
        });

        if (recorded.vehicleId !== null && sightings?.needsUpdate) {
            Sightings.updateVehicleIdForLicense(license, recorded.vehicleId);
        }
    }

    // The spot is stored before the reply is built, so the badge check can exclude
    // it and two people spotting the same new model at once cannot both be told they
    // were first. A database error must not cost the user their reply, though: on
    // master the write happened afterwards, so a failure still left the card posted.
    private async recordSpot(license: string, vehicleInfo: VehicleInfo, fuelInfo: FuelInfo): Promise<RecordedSpot> {
        try {
            const vehicle = await Vehicles.insert(vehicleInfo, fuelInfo, 'nl');
            const sighting = await Sightings.insert(
                license,
                this.interaction.user,
                this.interaction.id,
                this.interaction.channelId,
                this.interaction.guildId,
                this.getComment(),
                vehicle.id
            );

            return { vehicleId: vehicle.id, sightingId: sighting.id };
        } catch (error) {
            Output.error(`Could not record the spot for ${license}`, error);

            return { vehicleId: null, sightingId: null };
        }
    }

    // Without a stored sighting there is nothing to compare against, so the badge is
    // skipped rather than guessed at.
    private async isFirstModel(vehicleInfo: VehicleInfo, sightingId: number | null): Promise<boolean> {
        if (sightingId === null) {
            return false;
        }

        return FirstSpotter.isFirstModelInGuild(
            this.interaction.guildId,
            vehicleInfo.merk,
            vehicleInfo.handelsbenaming,
            sightingId
        );
    }

    private getComment(): string | null {
        return this.getArgument<string>('commentaar') || null;
    }

    protected async getNorwegianInfo(license: string) {
        const data = await this.fetchNorwegianData(license);

        if (!data) {
            await this.interaction.followUp('Ik kon dat Noorse kenteken niet ophalen.');
            return;
        }

        const generelt = data.kjoretoy?.godkjenning?.tekniskGodkjenning?.tekniskeData?.generelt;
        const brand = generelt?.merke?.[0]?.merke ?? '';
        const model = generelt?.handelsbetegnelse?.[0] ?? '';

        const engines = data.kjoretoy?.godkjenning?.tekniskGodkjenning?.tekniskeData?.motorOgDrivverk?.motor ?? [];

        const fuelDescription: string[] = [];
        for (const engine of engines) {
            const fuel = engine.drivstoff?.[0];
            if (!fuel?.maksNettoEffekt) {
                continue;
            }

            const emoji = fuel.drivstoffKode?.kodeNavn === 'Elektrisk' ? '⚡' : '⛽';
            fuelDescription.push(`${emoji} ${calculateHorsePower(fuel.maksNettoEffekt)}PK`);
        }

        const registeredDate = data.kjoretoy?.godkjenning?.forstegangsGodkjenning?.forstegangRegistrertDato;
        const registeredTimestamp = registeredDate ? new Date(registeredDate).getTime() : NaN;

        const { components, files } = LicenseView.buildNorwegian({
            license,
            brand,
            model,
            fuelDescription: fuelDescription.join('  ·  '),
            registeredTimestamp: isNaN(registeredTimestamp) ? 0 : registeredTimestamp,
            logo: await BrandLogo.resolve(brand),
        });

        await this.interaction.followUp({
            components,
            files,
            flags: MessageFlags.IsComponentsV2,
        });
    }

    private async fetchNorwegianData(license: string): Promise<StatensVegvesenFullData | null> {
        const url = `https://kjoretoyoppslag.atlas.vegvesen.no/ws/no/vegvesen/kjoretoy/kjoretoyoppslag/v1/oppslag/raw/${license}`;

        try {
            const response = await fetch(url);

            // The endpoint answers 410 with an empty body for every plate since it
            // was retired, so the body has to be checked before it is parsed.
            if (!response.ok) {
                return null;
            }

            const body = await response.text();
            if (!body.trim()) {
                return null;
            }

            const data: StatensVegvesenFullData = JSON.parse(body);

            return data;
        } catch {
            return null;
        }
    }
}
