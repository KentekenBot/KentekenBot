'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.addColumn('Sightings', 'comment', {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface) {
        queryInterface.removeColumn('Sightings', 'comment');
    },
};
