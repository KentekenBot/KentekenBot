'use strict';

// Every sighting from before the Vehicles table existed has vehicleId NULL, and
// the only repair was the lazy per-plate update when that exact plate was looked up
// again. One never-repeated plate was enough to keep the first-spotter badge and
// the /search counts wrong for a whole guild, so the licenses are matched up front.
//
// Sightings whose license is not in Vehicles at all stay NULL: nothing is known
// about those vehicles until someone looks the plate up again.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            `UPDATE Sightings
             SET vehicleId = (SELECT Vehicles.id FROM Vehicles WHERE Vehicles.license = Sightings.license)
             WHERE vehicleId IS NULL
               AND EXISTS (SELECT 1 FROM Vehicles WHERE Vehicles.license = Sightings.license)`
        );
    },

    // Deliberately empty: which rows were NULL before the backfill is not recorded
    // anywhere, so clearing vehicleId again would throw away ids that were set by
    // the application rather than by this migration.
    async down() {},
};
