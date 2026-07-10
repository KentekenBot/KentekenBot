import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import { LicenseViewData, NorwegianViewData } from '../types/license-view';
import { VehicleInfo } from '../models/vehicle-info';
import { Str } from './str';
import { DateTime } from './date-time';
import { DiscordTimestamps } from '../enums/discord-timestamps';

export class LicenseView {
    private static readonly ACCENT_DEFAULT = 0x5865f2;
    private static readonly ACCENT_ELECTRIC = 0x57f287;
    private static readonly ACCENT_DIESEL = 0x4e5058;
    private static readonly APK_WARNING_WINDOW_MS = 1000 * 60 * 60 * 24 * 60;
    private static readonly IMPORT_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 180;

    public static build(data: LicenseViewData, now = Date.now()): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(this.accentColor(data));

        this.addHeader(container, data);

        const specs = this.buildSpecs(data, now);
        const flags = this.buildFlags(data.vehicleInfo);
        if (specs || flags.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        }
        if (specs) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(specs));
        }
        if (flags.length > 0) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(flags.join('\n')));
        }

        const notes: string[] = [];
        if (data.badge) {
            notes.push(`🥇 ${data.badge}`);
        }
        if (data.comment) {
            notes.push(`💬 _${data.comment}_`);
        }
        if (notes.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(notes.join('\n')));
        }

        if (data.sightingsList) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Eerder gespot door**\n${data.sightingsList}`)
            );
        }

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(this.buildFooter(data)));

        container.addActionRowComponents(this.buildLinks(data.vehicleInfo.kenteken));

        return [container];
    }

    public static buildNotFound(license: string, formattedLicense: string, sightingsList: string): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(this.ACCENT_DEFAULT);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## Kenteken ${license} niet gevonden, rdw heeft m niet meer (rip)`)
        );
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**Eerder gespot door**\n${sightingsList}`)
        );

        if (formattedLicense) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${formattedLicense}`));
        }

        return [container];
    }

    public static buildNorwegian(data: NorwegianViewData): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(this.ACCENT_DEFAULT);

        const nameParts: string[] = [];
        if (data.brand) {
            nameParts.push(Str.toTitleCase(data.brand));
        }
        if (data.model) {
            nameParts.push(Str.toTitleCase(data.model));
        }
        const title = `## ${nameParts.length > 0 ? nameParts.join(' ') : data.license}`;

        if (data.brand) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${title}\n\`${data.license}\``))
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(this.logoUrl(data.brand)))
            );
        } else {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${title}\n\`${data.license}\``));
        }

        const specs: string[] = [];
        if (data.fuelDescription) {
            specs.push(data.fuelDescription);
        }
        if (data.registeredTimestamp) {
            specs.push(`🗓️ ${DateTime.getDiscordTimestamp(data.registeredTimestamp, DiscordTimestamps.SHORT_DATE)}`);
        }
        if (specs.length > 0) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(specs.join('\n')));
        }

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# 🇳🇴 ${data.license}`));

        return [container];
    }

    private static addHeader(container: ContainerBuilder, data: LicenseViewData): void {
        const vehicleInfo = data.vehicleInfo;

        const nameParts: string[] = [];
        if (vehicleInfo.merk) {
            nameParts.push(Str.toTitleCase(vehicleInfo.merk));
        }
        if (vehicleInfo.handelsbenaming.trim()) {
            nameParts.push(Str.toTitleCase(vehicleInfo.handelsbenaming.trim()));
        }

        const title = `## ${nameParts.length > 0 ? nameParts.join(' ') : data.formattedLicense}`;
        const subtitle = data.vehicleType
            ? `\`${data.formattedLicense}\` · ${data.vehicleType}`
            : `\`${data.formattedLicense}\``;

        if (vehicleInfo.merk) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${title}\n${subtitle}`))
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(this.logoUrl(vehicleInfo.merk)))
            );
            return;
        }

        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${title}\n${subtitle}`));
    }

    private static buildSpecs(data: LicenseViewData, now: number): string | null {
        const vehicleInfo = data.vehicleInfo;

        const firstLine: string[] = [];
        for (const engine of data.fuelInfo.engines) {
            if (engine.getHorsePower()) {
                firstLine.push(engine.getHorsePowerDescription());
            }
        }
        if (vehicleInfo.eerste_kleur) {
            firstLine.push(`🎨 ${Str.toTitleCase(vehicleInfo.eerste_kleur)}`);
        }
        if (vehicleInfo.getPrice()) {
            firstLine.push(vehicleInfo.getPriceDescription());
        }

        const secondLine: string[] = [];
        const constructionTimestamp = vehicleInfo.getConstructionDateTimestamp();
        if (!isNaN(constructionTimestamp)) {
            const constructionDate = DateTime.getDiscordTimestamp(constructionTimestamp, DiscordTimestamps.SHORT_DATE);
            secondLine.push(`🗓️ ${constructionDate} (${this.age(constructionTimestamp, now)})`);
        }

        const apk = this.apkDescription(vehicleInfo, now);
        if (apk) {
            secondLine.push(apk);
        }

        const lines: string[] = [];
        if (firstLine.length > 0) {
            lines.push(firstLine.join(' · '));
        }
        if (secondLine.length > 0) {
            lines.push(secondLine.join(' · '));
        }

        return lines.length > 0 ? lines.join('\n') : null;
    }

    private static apkDescription(vehicleInfo: VehicleInfo, now: number): string | null {
        const expiry = vehicleInfo.getApkExpiryTimestamp();
        if (!expiry) {
            return null;
        }

        if (expiry < now) {
            return `⚠️ APK verlopen ${DateTime.getDiscordTimestamp(expiry, DiscordTimestamps.RELATIVE)}`;
        }

        if (expiry - now < this.APK_WARNING_WINDOW_MS) {
            return `⚠️ APK verloopt ${DateTime.getDiscordTimestamp(expiry, DiscordTimestamps.RELATIVE)}`;
        }

        return `🔧 APK tot ${DateTime.getDiscordTimestamp(expiry, DiscordTimestamps.SHORT_DATE)}`;
    }

    private static buildFlags(vehicleInfo: VehicleInfo): string[] {
        const flags: string[] = [];

        if (vehicleInfo.openstaande_terugroepactie_indicator === 'Ja') {
            flags.push('⚠️ Openstaande terugroepactie');
        }

        if (vehicleInfo.wam_verzekerd === 'Nee') {
            flags.push('🛑 Niet WAM-verzekerd');
        }

        if (vehicleInfo.tellerstandoordeel === 'Onlogisch') {
            flags.push('📉 Onlogische tellerstand');
        }

        if (vehicleInfo.taxi_indicator === 'Ja') {
            flags.push('🚕 Taxiverleden');
        }

        if (vehicleInfo.export_indicator === 'Ja') {
            flags.push('📤 Geëxporteerd');
        }

        if (this.isImported(vehicleInfo)) {
            flags.push('📦 Geïmporteerd');
        }

        return flags;
    }

    private static isImported(vehicleInfo: VehicleInfo): boolean {
        const firstRegistrationNl = vehicleInfo.getFirstRegistrationInNetherlandsTimestamp();
        const constructionTimestamp = vehicleInfo.getConstructionDateTimestamp();

        if (!firstRegistrationNl || isNaN(constructionTimestamp)) {
            return false;
        }

        return firstRegistrationNl - constructionTimestamp > this.IMPORT_THRESHOLD_MS;
    }

    private static age(constructionTimestamp: number, now: number): string {
        const months = Math.floor((now - constructionTimestamp) / (1000 * 60 * 60 * 24 * 30.44));

        if (months < 1) {
            return 'nieuw';
        }

        if (months < 12) {
            return `${months} ${months === 1 ? 'maand' : 'maanden'}`;
        }

        const years = Math.floor(months / 12);
        return `${years} jaar`;
    }

    private static accentColor(data: LicenseViewData): number {
        const fuel = data.fuelInfo.engines[0]?.brandstof_omschrijving?.toLowerCase();

        if (fuel === 'elektriciteit') {
            return this.ACCENT_ELECTRIC;
        }

        if (fuel === 'diesel') {
            return this.ACCENT_DIESEL;
        }

        return this.ACCENT_DEFAULT;
    }

    private static buildFooter(data: LicenseViewData): string {
        if (data.spotCount && data.spotCount > 0) {
            return `-# ${data.spotCount}× gespot in deze server`;
        }

        return `-# ${data.formattedLicense}`;
    }

    private static buildLinks(license: string): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Kentekencheck')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://kentekencheck.nl/kenteken?i=${license}`),
            new ButtonBuilder()
                .setLabel('Finnik')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://finnik.nl/kenteken/${license}/gratis`)
        );
    }

    private static logoUrl(brand: string): string {
        return `https://www.kentekencheck.nl/assets/img/brands/${Str.humanToSnakeCase(brand)}.png`;
    }
}
