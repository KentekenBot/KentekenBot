'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('Sightings', 'discordChannelId', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    queryInterface.addColumn('Sightings', 'discordInteractionId', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('Sightings', 'discordChannelId');
    queryInterface.removeColumn('Sightings', 'discordInteractionId');
  }
};
