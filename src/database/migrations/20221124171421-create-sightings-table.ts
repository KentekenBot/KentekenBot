import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
    up: (queryInterface: QueryInterface): Promise<void> =>
        queryInterface.createTable('Sightings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER,
            },
            license: {
                type: DataTypes.STRING,
            },
            discordUserId: {
                type: DataTypes.STRING,
            },
            discordGuildId: {
                type: DataTypes.STRING,
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE,
            },
        }),

    down: (queryInterface: QueryInterface): Promise<void> => queryInterface.dropTable('Sighting'),
};

//
// 'use strict';
//
// import { QueryInterface } from 'sequelize';
//
// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//     async up(queryInterface: QueryInterface, Sequelize) {
//         await queryInterface.createTable('Sightings', {
//             id: {
//                 allowNull: false,
//                 autoIncrement: true,
//                 primaryKey: true,
//                 type: Sequelize.INTEGER,
//             },
//             license: {
//                 type: Sequelize.STRING,
//             },
//             discordUserId: {
//                 type: Sequelize.STRING,
//             },
//             discordGuildId: {
//                 type: Sequelize.STRING,
//             },
//             createdAt: {
//                 allowNull: false,
//                 type: Sequelize.DATE,
//             },
//             updatedAt: {
//                 allowNull: false,
//                 type: Sequelize.DATE,
//             },
//         });
//     },
//
//     async down(queryInterface: QueryInterface) {
//         await queryInterface.dropTable('Sightings');
//     },
// };
