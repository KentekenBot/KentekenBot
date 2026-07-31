import { HeroCard } from '../../src/util/hero-card';
import { HeroCardData } from '../../src/types/hero-card.types';

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// A 1x1 transparent png, enough for the renderer to embed something.
const LOGO = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==',
    'base64'
);

function cardData(overrides: Partial<HeroCardData> = {}): HeroCardData {
    return {
        brand: 'Ford',
        model: 'Fiesta',
        formattedLicense: 'H-943-HG',
        logo: LOGO,
        facts: [
            { label: 'Vermogen', value: '95 pk' },
            { label: 'Bouwjaar', value: '2020' },
        ],
        ...overrides,
    };
}

function dimensions(png: Buffer): { width: number; height: number } {
    return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

describe('HeroCard.render', () => {
    it('renders a png buffer', () => {
        expect(HeroCard.render(cardData()).subarray(0, 8)).toEqual(PNG_MAGIC);
    });

    // Discord fits the card to the width of the reply, so the canvas has to stay the
    // same shape whatever the vehicle is called.
    it('keeps the canvas identical regardless of content', () => {
        const short = dimensions(HeroCard.render(cardData()));
        const long = dimensions(
            HeroCard.render(
                cardData({
                    brand: 'Mercedes-Benz',
                    model: 'Sprinter Kastenwagen Hochdach Extralang 519 Cdi',
                    facts: [],
                })
            )
        );

        expect(long).toEqual(short);
        expect(short.width).toBe(short.height * 3);
    });

    it('renders without a brand, a model or any facts', () => {
        const card = HeroCard.render(cardData({ brand: '', model: '', facts: [] }));

        expect(card.subarray(0, 8)).toEqual(PNG_MAGIC);
    });

    it('draws more ink for a longer model name', () => {
        const short = HeroCard.render(cardData({ model: 'Ka' })).length;
        const long = HeroCard.render(cardData({ model: 'Transporter Kombi' })).length;

        expect(long).toBeGreaterThan(short);
    });
});
