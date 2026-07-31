// See first-spotter.spec.ts: the config is replaced so the models bind to an
// in-memory database instead of the development sqlite file.
jest.mock('../../src/config.json', () => ({ dialect: 'sqlite', storage: ':memory:', logging: false }));

import { sequelizeConnection } from '../../src/services/sequelize';
import { Sighting, Vehicle } from '../../src/models';
import { SpotSuggestions } from '../../src/queries/spot-suggestions';

const USER = 'user-1';

async function addSighting(license: string, discordUserId: string, minutesAgo: number): Promise<Sighting> {
    return Sighting.create({
        license,
        discordUserId,
        discordGuildId: 'guild-1',
        discordInteractionId: `i-${license}-${minutesAgo}`,
        vehicleId: null,
        comment: null,
        createdAt: new Date(Date.now() - minutesAgo * 60 * 1000),
    });
}

beforeAll(async () => {
    await sequelizeConnection.sync({ force: true });
});

afterAll(async () => {
    await sequelizeConnection.close();
});

beforeEach(async () => {
    await Sighting.destroy({ where: {} });
    await Vehicle.destroy({ where: {} });
});

describe('SpotSuggestions.forUser', () => {
    it('offers the most recent plates first', async () => {
        await addSighting('X897PL', USER, 30);
        await addSighting('H943HG', USER, 5);

        const choices = await SpotSuggestions.forUser(USER, '');

        expect(choices.map((choice) => choice.value)).toEqual(['H943HG', 'X897PL']);
    });

    it('offers a plate once, however often it was spotted', async () => {
        await addSighting('X897PL', USER, 30);
        await addSighting('X897PL', USER, 20);
        await addSighting('X897PL', USER, 10);

        const choices = await SpotSuggestions.forUser(USER, '');

        expect(choices).toHaveLength(1);
    });

    it('only offers your own spots', async () => {
        await addSighting('X897PL', USER, 10);
        await addSighting('H943HG', 'someone-else', 5);

        const choices = await SpotSuggestions.forUser(USER, '');

        expect(choices.map((choice) => choice.value)).toEqual(['X897PL']);
    });

    // What people type looks like a plate, not like what is stored.
    it('matches a partial plate typed with hyphens and lower case', async () => {
        await addSighting('X897PL', USER, 10);
        await addSighting('H943HG', USER, 5);

        const choices = await SpotSuggestions.forUser(USER, 'x-897');

        expect(choices.map((choice) => choice.value)).toEqual(['X897PL']);
    });

    it('names the vehicle when the plate is known', async () => {
        await Vehicle.create({ license: 'X897PL', brand: 'OPEL', tradeName: 'CORSA', country: 'nl' });
        const vehicle = await Vehicle.findOne({ where: { license: 'X897PL' } });
        await Sighting.create({
            license: 'X897PL',
            discordUserId: USER,
            discordGuildId: 'guild-1',
            discordInteractionId: 'i-named',
            vehicleId: vehicle ? vehicle.id : null,
            comment: null,
        });

        const choices = await SpotSuggestions.forUser(USER, '');

        expect(choices[0].name).toBe('X-897-PL (Opel Corsa)');
    });

    it('falls back to the plate alone when the vehicle is unknown', async () => {
        await addSighting('X897PL', USER, 10);

        const choices = await SpotSuggestions.forUser(USER, '');

        expect(choices[0].name).toBe('X-897-PL');
    });

    // Discord rejects an autocomplete response holding more than 25 choices.
    it('never offers more than discord accepts', async () => {
        for (let index = 0; index < 30; index++) {
            await addSighting(`X${String(index).padStart(3, '0')}PL`, USER, 30 - index);
        }

        const choices = await SpotSuggestions.forUser(USER, '');

        expect(choices).toHaveLength(25);
    });
});
