import { RandomSpotView } from '../../src/util/random-spot-view';
import { RandomSpot } from '../../src/types/random-spot';

const baseSpot: RandomSpot = {
    license: 'AB123C',
    comment: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    discordUserId: 'user-1',
    discordGuildId: 'guild-1',
    discordChannelId: 'chan-1',
    discordInteractionId: 'int-1',
    vehicle: {
        brand: 'VOLKSWAGEN',
        tradeName: 'GOLF',
        color: 'ZWART',
        totalHorsepower: '110',
        primaryFuelType: 'Benzine',
    },
};

describe('RandomSpotView', () => {
    it('renders the vehicle name, plate and metadata', () => {
        const embed = RandomSpotView.build(baseSpot).toJSON();

        expect(embed.description).toBe('`AB-123-C` — **Volkswagen Golf**');
        const vehicleField = (embed.fields ?? []).find((field) => field.name === 'Voertuig');
        expect(vehicleField?.value).toContain('🎨 Zwart');
        expect(vehicleField?.value).toContain('⛽ 110PK');
    });

    it('uses a lightning emoji for electric vehicles', () => {
        const electric: RandomSpot = {
            ...baseSpot,
            vehicle: { ...baseSpot.vehicle!, primaryFuelType: 'Elektriciteit' },
        };

        const embed = RandomSpotView.build(electric).toJSON();
        const vehicleField = (embed.fields ?? []).find((field) => field.name === 'Voertuig');

        expect(vehicleField?.value).toContain('⚡ 110PK');
    });

    it('links to the original spot message', () => {
        const embed = RandomSpotView.build(baseSpot).toJSON();
        const spotterField = (embed.fields ?? []).find((field) => field.value.includes('Gespot door'));

        expect(spotterField?.value).toContain('<@user-1>');
        expect(spotterField?.value).toContain('https://discord.com/channels/guild-1/chan-1/int-1');
    });

    it('falls back to just the plate when the vehicle is unknown', () => {
        const unknown: RandomSpot = { ...baseSpot, vehicle: null };

        const embed = RandomSpotView.build(unknown).toJSON();

        expect(embed.description).toBe('`AB-123-C`');
        expect((embed.fields ?? []).some((field) => field.name === 'Voertuig')).toBe(false);
    });
});
