'use strict';

// VehicleInfo stripped the brand out of the RDW trade name with a plain replace,
// so "VOLKSWAGEN GOLF" was stored as " GOLF". Every tradeName written before that
// replace started trimming carries the separating space, which the hero card and
// the first-spot badge render verbatim.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.sequelize.query(
            `UPDATE Vehicles
             SET tradeName = TRIM(tradeName)
             WHERE tradeName IS NOT NULL
               AND tradeName <> TRIM(tradeName)`
        );
    },

    // Deliberately empty: the stripped whitespace is not recorded anywhere, and
    // re-adding a leading space would be restoring the bug rather than the data.
    async down() {},
};
