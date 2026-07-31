// The real config points at the development sqlite file, so it is replaced before
// the models bind to a connection. These specs need a database, not a mock: the
// behaviour under test is which rows a query does and does not match.
jest.mock('../../src/config.json', () => ({ dialect: 'sqlite', storage: ':memory:', logging: false }));

import { sequelizeConnection } from '../../src/services/sequelize';
import { Sighting, Vehicle } from '../../src/models';
import { FirstSpotter } from '../../src/queries/first-spotter';

const GUILD = 'guild-1';
const OTHER_GUILD = 'guild-2';

async function addVehicle(license: string, brand: string, tradeName: string): Promise<Vehicle> {
    return Vehicle.create({ license, brand, tradeName, country: 'nl' });
}

async function addSighting(
    license: string,
    discordGuildId: string,
    vehicleId: number | null = null
): Promise<Sighting> {
    return Sighting.create({
        license,
        discordGuildId,
        discordUserId: 'user-1',
        discordInteractionId: `i-${license}-${discordGuildId}`,
        vehicleId,
        comment: null,
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

describe('FirstSpotter.isFirstModelInGuild', () => {
    it('needs a guild, a brand and a model', async () => {
        await expect(FirstSpotter.isFirstModelInGuild(null, 'OPEL', 'CORSA')).resolves.toBe(false);
        await expect(FirstSpotter.isFirstModelInGuild(GUILD, '', 'CORSA')).resolves.toBe(false);
        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', '')).resolves.toBe(false);
    });

    it('is not a first spot when the model is unknown to the vehicles table', async () => {
        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA')).resolves.toBe(false);
    });

    it('is a first spot when nobody in the guild has spotted the model', async () => {
        const vehicle = await addVehicle('X897PL', 'OPEL', 'CORSA');
        await addSighting('X897PL', OTHER_GUILD, vehicle.id);

        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA')).resolves.toBe(true);
    });

    it('is not a first spot when another plate of the same model was spotted here', async () => {
        const spotted = await addVehicle('X897PL', 'OPEL', 'CORSA');
        await addVehicle('Y123AB', 'OPEL', 'CORSA');
        await addSighting('X897PL', GUILD, spotted.id);

        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA')).resolves.toBe(false);
    });

    // The guard that skipped any guild holding a sighting with vehicleId NULL made
    // the badge permanently dead. Matching on the license instead means a legacy row
    // still counts, as long as the backfill could resolve its plate.
    it('counts a legacy sighting whose vehicle id was never filled in', async () => {
        await addVehicle('X897PL', 'OPEL', 'CORSA');
        await addSighting('X897PL', GUILD, null);

        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA')).resolves.toBe(false);
    });

    it('is not thrown off by an unrelated unresolved sighting in the guild', async () => {
        await addVehicle('X897PL', 'OPEL', 'CORSA');
        await addSighting('ZZ999Z', GUILD, null);

        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA')).resolves.toBe(true);
    });

    // Two people spotting the same new model at once would otherwise both be told
    // they were first, because each stores a row before the other is checked.
    it('leaves the sighting being answered out of its own comparison', async () => {
        const vehicle = await addVehicle('X897PL', 'OPEL', 'CORSA');
        const own = await addSighting('X897PL', GUILD, vehicle.id);

        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA', own.id)).resolves.toBe(true);
        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA')).resolves.toBe(false);
    });

    it('is not a first spot when someone else got there first in the same second', async () => {
        const vehicle = await addVehicle('X897PL', 'OPEL', 'CORSA');
        await addSighting('X897PL', GUILD, vehicle.id);
        const own = await Sighting.create({
            license: 'X897PL',
            discordGuildId: GUILD,
            discordUserId: 'user-2',
            discordInteractionId: 'i-second',
            vehicleId: vehicle.id,
            comment: null,
        });

        await expect(FirstSpotter.isFirstModelInGuild(GUILD, 'OPEL', 'CORSA', own.id)).resolves.toBe(false);
    });
});
