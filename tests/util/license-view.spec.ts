import { LicenseView } from '../../src/util/license-view';
import { LicenseViewData } from '../../src/types/license-view';
import { VehicleInfo } from '../../src/models/vehicle-info';
import { FuelInfo } from '../../src/models/fuel-info';
import { EngineInfo } from '../../src/models/engine-info';

const NOW = new Date('2026-07-10T12:00:00Z').getTime();

function textContents(containers: ReturnType<typeof LicenseView.build>): string {
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

function viewData(overrides: Partial<LicenseViewData> = {}): LicenseViewData {
    return {
        vehicleInfo: vehicleInfo(),
        fuelInfo: fuelInfo([{ nettomaximumvermogen: '74', brandstof_omschrijving: 'Benzine' }]),
        formattedLicense: 'X-897-PL',
        vehicleType: null,
        badge: null,
        comment: null,
        sightingsList: null,
        spotCount: null,
        ...overrides,
    };
}

describe('LicenseView.build', () => {
    it('renders the header with brand, model and the plate as a dutch plate block', () => {
        const contents = textContents(LicenseView.build(viewData(), NOW));

        expect(contents).toContain('## Opel Corsa');
        expect(contents).toContain('```ansi');
        expect(contents).toContain(' X-897-PL ');
    });

    it('renders specs with power, colour, price, age and apk', () => {
        const contents = textContents(LicenseView.build(viewData(), NOW));

        expect(contents).toContain('⛽ 101PK');
        expect(contents).toContain('🎨 Grijs');
        expect(contents).toContain('💵');
        expect(contents).toContain('(2 jaar)');
        expect(contents).toContain('🔧 APK tot');
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

        const contents = textContents(LicenseView.build(data, NOW));

        expect(contents).not.toContain('🎨');
        expect(contents).not.toContain('💵');
        expect(contents).not.toContain('Onbekend');
        expect(contents).not.toContain('APK');
        expect(contents).not.toContain('🗓️');
        expect(contents).toContain('## Opel Corsa');
    });

    it('shows both engines of a hybrid', () => {
        const data = viewData({
            fuelInfo: fuelInfo([
                { nettomaximumvermogen: '74', brandstof_omschrijving: 'Benzine' },
                { netto_max_vermogen_elektrisch: '50', brandstof_omschrijving: 'Elektriciteit' },
            ]),
        });

        const contents = textContents(LicenseView.build(data, NOW));

        expect(contents).toContain('⛽ 101PK');
        expect(contents).toContain('⚡ 68PK');
    });

    it('falls back to the plate as title when brand and model are missing', () => {
        const data = viewData({ vehicleInfo: vehicleInfo({ merk: '', handelsbenaming: '' }) });

        const contents = textContents(LicenseView.build(data, NOW));

        expect(contents).toContain('## X-897-PL');
    });

    it('warns when the apk has expired', () => {
        const data = viewData({ vehicleInfo: vehicleInfo({ vervaldatum_apk_dt: '2025-01-19T00:00:00.000' }) });

        const contents = textContents(LicenseView.build(data, NOW));

        expect(contents).toContain('⚠️ APK verlopen');
    });

    it('shows status flags only when applicable', () => {
        const clean = textContents(LicenseView.build(viewData(), NOW));
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
        const contents = textContents(LicenseView.build(flagged, NOW));

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

        expect(textContents(LicenseView.build(data, NOW))).toContain('📦 Geïmporteerd');
    });

    it('renders badge, comment, sightings and spot count', () => {
        const data = viewData({
            badge: 'Je bent de eerste!',
            comment: 'mooie kar',
            sightingsList: '<@user-1> - 2 maanden geleden',
            spotCount: 3,
        });

        const contents = textContents(LicenseView.build(data, NOW));

        expect(contents).toContain('🥇 Je bent de eerste!');
        expect(contents).toContain('💬 _mooie kar_');
        expect(contents).toContain('**Eerder gespot door**');
        expect(contents).toContain('-# 3× gespot in deze server');
    });

    it('uses an accent colour based on the primary fuel type', () => {
        const electric = viewData({
            fuelInfo: fuelInfo([{ netto_max_vermogen_elektrisch: '150', brandstof_omschrijving: 'Elektriciteit' }]),
        });
        const diesel = viewData({
            fuelInfo: fuelInfo([{ nettomaximumvermogen: '100', brandstof_omschrijving: 'Diesel' }]),
        });

        expect(LicenseView.build(electric, NOW)[0].toJSON().accent_color).toBe(0x57f287);
        expect(LicenseView.build(diesel, NOW)[0].toJSON().accent_color).toBe(0x4e5058);
        expect(LicenseView.build(viewData(), NOW)[0].toJSON().accent_color).toBe(0x5865f2);
    });
});

describe('LicenseView.buildNotFound', () => {
    it('renders the not-found message with the sightings list', () => {
        const contents = textContents(LicenseView.buildNotFound('X897PL', 'X-897-PL', '<@user-1> - gisteren'));

        expect(contents).toContain('niet gevonden');
        expect(contents).toContain('**Eerder gespot door**');
        expect(contents).toContain('-# X-897-PL');
    });
});

describe('LicenseView.buildNorwegian', () => {
    it('renders the norwegian vehicle with flag footer', () => {
        const contents = textContents(
            LicenseView.buildNorwegian({
                license: 'AB12345',
                brand: 'VOLVO',
                model: 'XC90',
                fuelDescription: '⚡ 408PK',
                registeredTimestamp: NOW,
            })
        );

        expect(contents).toContain('## Volvo Xc90');
        expect(contents).toContain('⚡ 408PK');
        expect(contents).toContain('-# 🇳🇴 AB12345');
    });
});
