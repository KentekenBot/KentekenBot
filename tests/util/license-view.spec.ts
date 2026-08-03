import { ComponentType, ContainerBuilder } from 'discord.js';
import { LicenseView } from '../../src/util/license-view';
import { LicenseViewData } from '../../src/types/license-view.types';
import { SightingsSpotter, SightingsSummary } from '../../src/types/sighting.types';
import { VehicleInfo } from '../../src/models/vehicle-info';
import { FuelInfo } from '../../src/models/fuel-info';
import { EngineInfo } from '../../src/models/engine-info';

const NOW = new Date('2026-07-10T12:00:00Z').getTime();

// A 1x1 transparent png, enough for the hero card to embed something.
const LOGO = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==',
    'base64'
);

function textContents(containers: ContainerBuilder[]): string {
    const contents: string[] = [];

    for (const container of containers) {
        for (const component of container.toJSON().components) {
            if ('content' in component && typeof component.content === 'string') {
                contents.push(component.content);
            }
            if ('components' in component && Array.isArray(component.components)) {
                for (const child of component.components) {
                    if ('content' in child && typeof child.content === 'string') {
                        contents.push(child.content);
                    }
                }
            }
        }
    }

    return contents.join('\n');
}

function gallery(containers: ContainerBuilder[]): string {
    const component = containers[0].toJSON().components.find(function (candidate) {
        return candidate.type === ComponentType.MediaGallery;
    });

    return JSON.stringify(component);
}

function vehicleInfo(overrides: Record<string, unknown> = {}): VehicleInfo {
    return new VehicleInfo({
        kenteken: 'X897PL',
        merk: 'OPEL',
        handelsbenaming: 'CORSA',
        eerste_kleur: 'GRIJS',
        catalogusprijs: '27247',
        datum_eerste_toelating: '20240119',
        datum_eerste_toelating_dt: '2024-01-19T00:00:00.000',
        datum_eerste_tenaamstelling_in_nederland_dt: '2024-01-19T00:00:00.000',
        vervaldatum_apk_dt: '2028-01-19T00:00:00.000',
        openstaande_terugroepactie_indicator: 'Nee',
        wam_verzekerd: 'Ja',
        tellerstandoordeel: 'Logisch',
        taxi_indicator: 'Nee',
        export_indicator: 'Nee',
        ...overrides,
    });
}

function fuelInfo(engines: Record<string, unknown>[]): FuelInfo {
    const info = new FuelInfo();
    for (const engine of engines) {
        info.engines.push(new EngineInfo(engine));
    }
    return info;
}

function spotter(discordUserId: string, count: number, overrides: Partial<SightingsSpotter> = {}): SightingsSpotter {
    return {
        discordUserId,
        count,
        lastSightingAt: NOW - 1000 * 60 * 4,
        lastSightingUrl: null,
        ...overrides,
    };
}

function sightingsSummary(overrides: Partial<SightingsSummary> = {}): SightingsSummary {
    return {
        total: 8,
        spotters: [spotter('user-1', 6), spotter('user-2', 2)],
        lastComment: null,
        needsUpdate: false,
        ...overrides,
    };
}

function viewData(overrides: Partial<LicenseViewData> = {}): LicenseViewData {
    return {
        vehicleInfo: vehicleInfo(),
        fuelInfo: fuelInfo([{ nettomaximumvermogen: '74', brandstof_omschrijving: 'Benzine' }]),
        formattedLicense: 'X-897-PL',
        vehicleType: null,
        badge: null,
        forSale: null,
        comment: null,
        sightings: null,
        logo: { image: LOGO },
        ...overrides,
    };
}

describe('LicenseView.build', () => {
    it('attaches the hero card and references it from the container', () => {
        const { components, files } = LicenseView.build(viewData(), NOW);

        expect(files).toHaveLength(1);
        expect(gallery(components)).toContain(`attachment://${files[0].name}`);
    });

    // The brand, model and plate are drawn into the image, so they have to stay in
    // message text somewhere for Discord's search to reach them.
    it('keeps the brand, model and plate searchable in the caption', () => {
        const contents = textContents(LicenseView.build(viewData(), NOW).components);

        expect(contents).toContain('-# Opel Corsa · X-897-PL');
    });

    it('names the attachment after the car so it can be found by filename', () => {
        const { files } = LicenseView.build(viewData(), NOW);

        expect(files[0].name).toBe('opel-corsa-x897pl.png');
    });

    it('falls back to the plate as the attachment name when the model is unknown', () => {
        const data = viewData({ vehicleInfo: vehicleInfo({ merk: '', handelsbenaming: '' }) });
        const { files } = LicenseView.build(data, NOW);

        expect(files[0].name).toBe('x897pl.png');
    });

    // Mobile clients turn an item description into a caption strip over the image,
    // repeating the caption line underneath it.
    it('does not describe the image', () => {
        expect(gallery(LicenseView.build(viewData(), NOW).components)).not.toContain('description');
    });

    it('renders the specs the card does not carry, without emoji or date pills', () => {
        const contents = textContents(LicenseView.build(viewData({ vehicleType: 'Personenauto' }), NOW).components);

        // Intl puts a non-breaking space after the euro sign.
        expect(contents).toContain('**Benzine** · Grijs · Personenauto · € 27.247');
        expect(contents).not.toContain('⛽');
        expect(contents).not.toContain('🎨');
        expect(contents).not.toContain('💵');
        expect(contents).not.toContain('🗓️');
        expect(contents).not.toMatch(/<t:\d+:d>/);
    });

    it('skips missing fields instead of showing placeholders', () => {
        const data = viewData({
            vehicleInfo: vehicleInfo({
                eerste_kleur: '',
                catalogusprijs: '',
                vervaldatum_apk_dt: '',
                datum_eerste_toelating: '',
            }),
            fuelInfo: fuelInfo([]),
        });

        const contents = textContents(LicenseView.build(data, NOW).components);

        expect(contents).not.toContain('Onbekend');
        expect(contents).not.toContain('APK');
        expect(contents).toContain('-# Opel Corsa · X-897-PL');
    });

    it('shows both fuels of a hybrid', () => {
        const data = viewData({
            fuelInfo: fuelInfo([
                { nettomaximumvermogen: '74', brandstof_omschrijving: 'Benzine' },
                { netto_max_vermogen_elektrisch: '50', brandstof_omschrijving: 'Elektriciteit' },
            ]),
        });

        expect(textContents(LicenseView.build(data, NOW).components)).toContain('**Benzine + Elektriciteit**');
    });

    it('only mentions the apk in text when it needs attention', () => {
        const healthy = textContents(LicenseView.build(viewData(), NOW).components);
        expect(healthy).not.toContain('APK');

        const expired = viewData({ vehicleInfo: vehicleInfo({ vervaldatum_apk_dt: '2025-01-19T00:00:00.000' }) });
        expect(textContents(LicenseView.build(expired, NOW).components)).toContain('⚠️ APK verlopen');

        const expiring = viewData({ vehicleInfo: vehicleInfo({ vervaldatum_apk_dt: '2026-08-01T00:00:00.000' }) });
        expect(textContents(LicenseView.build(expiring, NOW).components)).toContain('⚠️ APK verloopt');
    });

    it('shows status flags only when applicable', () => {
        const clean = textContents(LicenseView.build(viewData(), NOW).components);
        expect(clean).not.toContain('terugroepactie');
        expect(clean).not.toContain('WAM');
        expect(clean).not.toContain('tellerstand');

        const flagged = viewData({
            vehicleInfo: vehicleInfo({
                openstaande_terugroepactie_indicator: 'Ja',
                wam_verzekerd: 'Nee',
                tellerstandoordeel: 'Onlogisch',
            }),
        });
        const contents = textContents(LicenseView.build(flagged, NOW).components);

        expect(contents).toContain('⚠️ Openstaande terugroepactie');
        expect(contents).toContain('🛑 Niet WAM-verzekerd');
        expect(contents).toContain('📉 Onlogische tellerstand');
    });

    it('flags imports when the first registration in NL is much later', () => {
        const data = viewData({
            vehicleInfo: vehicleInfo({
                datum_eerste_tenaamstelling_in_nederland_dt: '2026-01-19T00:00:00.000',
            }),
        });

        expect(textContents(LicenseView.build(data, NOW).components)).toContain('📦 Geïmporteerd');
    });

    it('lists each spotter with their count and last spot', () => {
        const data = viewData({
            sightings: sightingsSummary({
                spotters: [
                    spotter('user-1', 6, { lastSightingUrl: 'https://discordapp.com/channels/1/2/3' }),
                    spotter('user-2', 2),
                ],
            }),
        });

        const contents = textContents(LicenseView.build(data, NOW).components);

        expect(contents).toContain('**8× gespot**');
        expect(contents).not.toContain('**8× gespot** — laatst');
        expect(contents).toMatch(
            /- <@user-1> 6× — laatst \[<t:\d+:R>\]\(https:\/\/discordapp\.com\/channels\/1\/2\/3\)/
        );
        expect(contents).toMatch(/- <@user-2> 2× — laatst <t:\d+:R>/);
    });

    it('counts the spotters it does not name', () => {
        const data = viewData({
            sightings: sightingsSummary({
                spotters: [
                    spotter('user-1', 4),
                    spotter('user-2', 3),
                    spotter('user-3', 2),
                    spotter('user-4', 1),
                    spotter('user-5', 1),
                ],
            }),
        });

        const contents = textContents(LicenseView.build(data, NOW).components);

        expect(contents).toContain('<@user-3> 2×');
        expect(contents).not.toContain('<@user-4>');
        expect(contents).toContain('- en 2 anderen');
    });

    it('renders badge and comment', () => {
        const data = viewData({ badge: 'Je bent de eerste!', comment: 'mooie kar' });

        const contents = textContents(LicenseView.build(data, NOW).components);

        expect(contents).toContain('🥇 Je bent de eerste!');
        expect(contents).toContain('💬 _mooie kar_');
    });

    it('renders the for-sale note above the first-spot badge', () => {
        const data = viewData({
            badge: 'Je bent de eerste!',
            forSale: {
                title: 'Ford Ka 1.2 69pk 2012 Wit',
                url: 'https://www.marktplaats.nl/v/auto-s/ford/m1-ford-ka',
                priceCents: 290000,
            },
        });

        const contents = textContents(LicenseView.build(data, NOW).components);

        expect(contents).toContain('🏷️ Deze auto staat **te koop**');
        expect(contents).toContain('(https://www.marktplaats.nl/v/auto-s/ford/m1-ford-ka)');
        expect(contents.indexOf('🏷️')).toBeLessThan(contents.indexOf('🥇'));
    });

    it('uses an accent colour based on the primary fuel type', () => {
        const electric = viewData({
            fuelInfo: fuelInfo([{ netto_max_vermogen_elektrisch: '150', brandstof_omschrijving: 'Elektriciteit' }]),
        });
        const diesel = viewData({
            fuelInfo: fuelInfo([{ nettomaximumvermogen: '100', brandstof_omschrijving: 'Diesel' }]),
        });

        expect(LicenseView.build(electric, NOW).components[0].toJSON().accent_color).toBe(0x57f287);
        expect(LicenseView.build(diesel, NOW).components[0].toJSON().accent_color).toBe(0x4e5058);
        expect(LicenseView.build(viewData(), NOW).components[0].toJSON().accent_color).toBe(0x5865f2);
    });
});

describe('LicenseView.buildNotFound', () => {
    it('renders the not-found message with the sightings summary', () => {
        const contents = textContents(LicenseView.buildNotFound('X897PL', 'X-897-PL', sightingsSummary()));

        expect(contents).toContain('niet gevonden');
        expect(contents).toContain('**8× gespot**');
        expect(contents).toContain('-# X-897-PL');
    });
});

describe('LicenseView.buildNorwegian', () => {
    function norwegianData(brand: string) {
        return {
            license: 'AB12345',
            brand,
            model: 'XC90',
            fuelDescription: '⚡ 408PK',
            registeredTimestamp: NOW,
            logo: { image: LOGO },
        };
    }

    it('renders the norwegian vehicle with flag footer', () => {
        const contents = textContents(LicenseView.buildNorwegian(norwegianData('VOLVO')).components);

        expect(contents).toContain('## Volvo Xc90');
        expect(contents).toContain('⚡ 408PK');
        expect(contents).toContain('-# 🇳🇴 AB12345');
    });

    it('attaches the logo and points the thumbnail at it', () => {
        const { components, files } = LicenseView.buildNorwegian(norwegianData('VOLVO'));

        expect(files).toHaveLength(1);
        expect(files[0].name).toBe('merk.png');
        expect(JSON.stringify(components[0].toJSON())).toContain('attachment://merk.png');
    });

    it('skips the logo when the brand is unknown', () => {
        expect(LicenseView.buildNorwegian(norwegianData('')).files).toHaveLength(0);
    });
});
