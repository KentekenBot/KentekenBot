import { RandomSpotView } from '../../src/util/random-spot-view';
import { RandomSpot } from '../../src/types/random-spot';

function textContents(containers: ReturnType<typeof RandomSpotView.build>): string {
    const contents: string[] = [];

    for (const container of containers) {
        for (const component of container.toJSON().components) {
            if ('content' in component && typeof component.content === 'string') {
                contents.push(component.content);
            }
        }
    }

    return contents.join('\n');
}

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
    it('renders the vehicle name, plate and metadata in a components v2 container', () => {
        const contents = textContents(RandomSpotView.build(baseSpot));

        expect(contents).toContain('## 🎲 Random spot');
        expect(contents).toContain('`AB-123-C` — **Volkswagen Golf**');
        expect(contents).toContain('🎨 Zwart');
        expect(contents).toContain('⛽ 110PK');
    });

    it('uses a lightning emoji for electric vehicles', () => {
        const electric: RandomSpot = {
            ...baseSpot,
            vehicle: { ...baseSpot.vehicle!, primaryFuelType: 'Elektriciteit' },
        };

        expect(textContents(RandomSpotView.build(electric))).toContain('⚡ 110PK');
    });

    it('links to the original spot message', () => {
        const contents = textContents(RandomSpotView.build(baseSpot));

        expect(contents).toContain('Gespot door <@user-1>');
        expect(contents).toContain('https://discord.com/channels/guild-1/chan-1/int-1');
    });

    it('shows the comment when present', () => {
        const withComment: RandomSpot = { ...baseSpot, comment: 'mooie wagen' };

        expect(textContents(RandomSpotView.build(withComment))).toContain('💬 _mooie wagen_');
    });

    it('falls back to just the plate when the vehicle is unknown', () => {
        const unknown: RandomSpot = { ...baseSpot, vehicle: null };

        const contents = textContents(RandomSpotView.build(unknown));

        expect(contents).toContain('`AB-123-C`');
        expect(contents).not.toContain('🎨');
    });
});
