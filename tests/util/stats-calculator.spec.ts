import { StatsCalculator } from '../../src/util/stats-calculator';
import { StatSpot } from '../../src/types/stats';

function spot(overrides: Partial<StatSpot> & { license: string }): StatSpot {
    return {
        createdAt: new Date('2024-01-01T00:00:00Z'),
        vehicle: null,
        ...overrides,
    };
}

function vehicle(overrides: Partial<NonNullable<StatSpot['vehicle']>> = {}): NonNullable<StatSpot['vehicle']> {
    return {
        brand: null,
        tradeName: null,
        price: null,
        primaryFuelType: null,
        dateFirstAllowed: null,
        ...overrides,
    };
}

describe('StatsCalculator.compute', () => {
    it('returns zeroed values for no spots', () => {
        const profile = StatsCalculator.compute([]);

        expect(profile).toEqual({
            totalSpots: 0,
            uniquePlates: 0,
            favoriteBrand: null,
            mostExpensive: null,
            oldest: null,
            electricCount: 0,
            fuelCount: 0,
            firstSpotAt: null,
        });
    });

    it('counts total spots and unique plates', () => {
        const profile = StatsCalculator.compute([
            spot({ license: 'AB123C' }),
            spot({ license: 'AB123C' }),
            spot({ license: 'XY999Z' }),
        ]);

        expect(profile.totalSpots).toBe(3);
        expect(profile.uniquePlates).toBe(2);
    });

    it('picks the most spotted brand as favorite', () => {
        const profile = StatsCalculator.compute([
            spot({ license: 'A', vehicle: vehicle({ brand: 'VOLKSWAGEN' }) }),
            spot({ license: 'B', vehicle: vehicle({ brand: 'VOLKSWAGEN' }) }),
            spot({ license: 'C', vehicle: vehicle({ brand: 'AUDI' }) }),
        ]);

        expect(profile.favoriteBrand).toEqual({ name: 'VOLKSWAGEN', count: 2 });
    });

    it('finds the most expensive and oldest vehicles', () => {
        const profile = StatsCalculator.compute([
            spot({
                license: 'A',
                vehicle: vehicle({
                    brand: 'VW',
                    tradeName: 'GOLF',
                    price: 30000,
                    dateFirstAllowed: new Date('2019-01-01'),
                }),
            }),
            spot({
                license: 'B',
                vehicle: vehicle({
                    brand: 'PORSCHE',
                    tradeName: '911',
                    price: 145000,
                    dateFirstAllowed: new Date('2021-01-01'),
                }),
            }),
            spot({
                license: 'C',
                vehicle: vehicle({
                    brand: 'MERCEDES',
                    tradeName: '280 SL',
                    price: null,
                    dateFirstAllowed: new Date('1978-01-01'),
                }),
            }),
        ]);

        expect(profile.mostExpensive).toMatchObject({ license: 'B', price: 145000 });
        expect(profile.oldest).toMatchObject({ license: 'C', brand: 'MERCEDES' });
        expect(profile.oldest?.date.getFullYear()).toBe(1978);
    });

    it('splits electric and combustion counts and ignores vehicles without fuel', () => {
        const profile = StatsCalculator.compute([
            spot({ license: 'A', vehicle: vehicle({ primaryFuelType: 'Elektriciteit' }) }),
            spot({ license: 'B', vehicle: vehicle({ primaryFuelType: 'Benzine' }) }),
            spot({ license: 'C', vehicle: vehicle({ primaryFuelType: 'Diesel' }) }),
            spot({ license: 'D', vehicle: vehicle({ primaryFuelType: null }) }),
        ]);

        expect(profile.electricCount).toBe(1);
        expect(profile.fuelCount).toBe(2);
    });

    it('finds the earliest spot date', () => {
        const profile = StatsCalculator.compute([
            spot({ license: 'A', createdAt: new Date('2024-05-01T00:00:00Z') }),
            spot({ license: 'B', createdAt: new Date('2023-02-01T00:00:00Z') }),
        ]);

        expect(profile.firstSpotAt?.toISOString()).toBe('2023-02-01T00:00:00.000Z');
    });
});
