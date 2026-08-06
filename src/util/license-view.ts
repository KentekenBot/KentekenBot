import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import { LicenseViewData, LicenseViewMessage, NorwegianViewData } from '../types/license-view.types';
import { BrandLogoResult } from '../types/brand-logo.types';
import { BrandLogo } from './brand-logo';
import { VehicleInfo } from '../models/vehicle-info';
import { HeroCard } from './hero-card';
import { HeroCardFact } from '../types/hero-card.types';
import { SightingsSummary } from '../types/sighting.types';
import { Str } from './str';
import { DateTime } from './date-time';
import { formatCurrency } from './format-currency';
import { ForSaleBadge } from './for-sale-badge';
import { DiscordTimestamps } from '../enums/discord-timestamps';

export class LicenseView {
    private static readonly ACCENT_DEFAULT = 0x5865f2;
    private static readonly ACCENT_ELECTRIC = 0x57f287;
    private static readonly ACCENT_DIESEL = 0x4e5058;
    private static readonly APK_WARNING_WINDOW_MS = 1000 * 60 * 60 * 24 * 60;
    private static readonly IMPORT_THRESHOLD_MS = 1000 * 60 * 60 * 24 * 180;
    private static readonly SPOTTERS_SHOWN = 3;

    public static build(data: LicenseViewData, now = Date.now()): LicenseViewMessage {
        const container = new ContainerBuilder().setAccentColor(this.accentColor(data));

        const fileName = this.buildFileName(data);
        this.addHero(container, fileName);

        const specs = this.buildSpecs(data);
        if (specs) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(specs));
        }

        const flags = this.buildFlags(data.vehicleInfo, now);
        if (flags.length > 0) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${flags.join(' · ')}`));
        }

        const notes: string[] = [];
        if (data.forSale) {
            notes.push(`🏷️ ${ForSaleBadge.message(data.forSale)}`);
        }
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

        const sightings = this.buildSightings(data.sightings);
        if (sightings) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(sightings));
        }

        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(this.buildCaption(data)));

        container.addActionRowComponents(this.buildLinks(data.vehicleInfo.kenteken));

        const hero = HeroCard.render({
            brand: this.brandName(data),
            model: this.modelName(data),
            formattedLicense: data.formattedLicense,
            logo: data.logo.image,
            facts: this.buildFacts(data, now),
            tag: data.forSale ? ForSaleBadge.tag(data.forSale) : null,
        });

        return { components: [container], files: [new AttachmentBuilder(hero, { name: fileName })] };
    }

    // No description on the item: mobile clients render it as a caption strip over
    // the image, which repeats what the caption line already says.
    private static addHero(container: ContainerBuilder, fileName: string): void {
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(`attachment://${fileName}`))
        );
    }

    // Discord can find a message by the name of its attachment, which covers the
    // unhyphenated spelling of the plate that the caption does not.
    private static buildFileName(data: LicenseViewData): string {
        const parts = [this.brandName(data), this.modelName(data), data.vehicleInfo.kenteken];

        const slug: string[] = [];
        for (const part of parts) {
            const cleaned = part
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            if (cleaned) {
                slug.push(cleaned);
            }
        }

        return `${slug.join('-') || 'kenteken'}.${HeroCard.FILE_NAME_EXTENSION}`;
    }

    // The brand, model and plate are set in the image, where Discord's search cannot
    // read them, so they ride along in the caption that was already there.
    private static buildCaption(data: LicenseViewData): string {
        const parts: string[] = [];

        const name = [this.brandName(data), this.modelName(data)].join(' ').trim();
        if (name) {
            parts.push(name);
        }

        parts.push(data.formattedLicense);

        return `-# ${parts.join(' · ')}`;
    }

    private static brandName(data: LicenseViewData): string {
        return data.vehicleInfo.merk ? Str.toTitleCase(data.vehicleInfo.merk) : '';
    }

    private static modelName(data: LicenseViewData): string {
        const model = data.vehicleInfo.handelsbenaming;

        return model ? Str.toTitleCase(model) : '';
    }

    private static buildLogoAttachment(logo: BrandLogoResult): AttachmentBuilder {
        return new AttachmentBuilder(logo.image, { name: BrandLogo.FILE_NAME });
    }

    public static buildNotFound(
        license: string,
        formattedLicense: string,
        sightings: SightingsSummary
    ): ContainerBuilder[] {
        const container = new ContainerBuilder().setAccentColor(this.ACCENT_DEFAULT);

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## Kenteken ${license} niet gevonden, rdw heeft m niet meer (rip)`)
        );

        const summary = this.buildSightings(sightings);
        if (summary) {
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(summary));
        }

        if (formattedLicense) {
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${formattedLicense}`));
        }

        return [container];
    }

    public static buildNorwegian(data: NorwegianViewData): LicenseViewMessage {
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
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(`attachment://${BrandLogo.FILE_NAME}`))
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

        const files = data.brand ? [this.buildLogoAttachment(data.logo)] : [];

        return { components: [container], files };
    }

    // Power, construction year and apk expiry are set in the hero card, so the text
    // carries what the image does not: the colour, the fuel and the price. No emoji
    // and no timestamp pills, which is what made the old block look pasted together.
    private static buildSpecs(data: LicenseViewData): string | null {
        const vehicleInfo = data.vehicleInfo;
        const parts: string[] = [];

        const fuels: string[] = [];
        for (const engine of data.fuelInfo.engines) {
            const fuel = engine.brandstof_omschrijving;
            if (fuel && !fuels.includes(fuel)) {
                fuels.push(fuel);
            }
        }
        if (fuels.length > 0) {
            parts.push(`**${fuels.join(' + ')}**`);
        }

        if (vehicleInfo.eerste_kleur) {
            parts.push(Str.toTitleCase(vehicleInfo.eerste_kleur));
        }

        if (data.vehicleType) {
            parts.push(data.vehicleType);
        }

        const price = vehicleInfo.getPrice();
        if (price) {
            parts.push(formatCurrency(price));
        }

        return parts.length > 0 ? parts.join(' · ') : null;
    }

    // The headline numbers, drawn into the card beside the plate.
    private static buildFacts(data: LicenseViewData, now: number): HeroCardFact[] {
        const facts: HeroCardFact[] = [];

        const power: string[] = [];
        for (const engine of data.fuelInfo.engines) {
            const horsePower = engine.getHorsePower();
            if (horsePower) {
                power.push(`${horsePower} pk`);
            }
        }
        if (power.length > 0) {
            facts.push({ label: 'Vermogen', value: power.join(' + ') });
        }

        const constructionTimestamp = data.vehicleInfo.getConstructionDateTimestamp();
        if (!isNaN(constructionTimestamp)) {
            facts.push({ label: 'Bouwjaar', value: String(data.vehicleInfo.getConstructionYear()) });
        }

        const expiry = data.vehicleInfo.getApkExpiryTimestamp();
        if (expiry) {
            facts.push({ label: expiry < now ? 'APK verlopen' : 'APK tot', value: DateTime.toMonthAndYear(expiry) });
        }

        return facts;
    }

    private static buildSightings(sightings: SightingsSummary | null): string | null {
        if (!sightings) {
            return null;
        }

        const lines = [`**${sightings.total}× gespot**`];

        for (const spotter of sightings.spotters.slice(0, this.SPOTTERS_SHOWN)) {
            const spotterLast = DateTime.getDiscordTimestamp(spotter.lastSightingAt, DiscordTimestamps.RELATIVE);
            const spotterLink = spotter.lastSightingUrl ? `[${spotterLast}](${spotter.lastSightingUrl})` : spotterLast;

            lines.push(`- <@${spotter.discordUserId}> ${spotter.count}× — laatst ${spotterLink}`);
        }

        const remaining = sightings.spotters.length - this.SPOTTERS_SHOWN;
        if (remaining > 0) {
            lines.push(`- en ${remaining} ${remaining === 1 ? 'ander' : 'anderen'}`);
        }

        if (sightings.lastComment) {
            lines.push(`-# 💬 _${sightings.lastComment}_`);
        }

        return lines.join('\n');
    }

    // The card states the apk date plainly. Text only speaks up when the date is
    // something to worry about, which is the one place an emoji still earns its keep.
    private static apkWarning(vehicleInfo: VehicleInfo, now: number): string | null {
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

        return null;
    }

    private static buildFlags(vehicleInfo: VehicleInfo, now: number): string[] {
        const flags: string[] = [];

        const apk = this.apkWarning(vehicleInfo, now);
        if (apk) {
            flags.push(apk);
        }

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
}
