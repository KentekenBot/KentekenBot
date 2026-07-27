'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        await queryInterface.addIndex('Sightings', ['discordGuildId'], {
            name: 'sightings_discord_guild_id',
        });
        await queryInterface.addIndex('Sightings', ['discordUserId'], {
            name: 'sightings_discord_user_id',
        });
        await queryInterface.addIndex('Sightings', ['license'], {
            name: 'sightings_license',
        });
        await queryInterface.addIndex('Sightings', ['vehicleId'], {
            name: 'sightings_vehicle_id',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('Sightings', 'sightings_discord_guild_id');
        await queryInterface.removeIndex('Sightings', 'sightings_discord_user_id');
        await queryInterface.removeIndex('Sightings', 'sightings_license');
        await queryInterface.removeIndex('Sightings', 'sightings_vehicle_id');
    },
};
