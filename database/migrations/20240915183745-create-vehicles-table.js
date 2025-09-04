'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      license: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tradeName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dateFirstAllowed: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dateFirstRegistration: {
        type: Sequelize.DATE,
        allowNull: true
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      vehicleType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      interiorType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true
      },
      totalHorsepower: {
        type: Sequelize.STRING,
        allowNull: true
      },
      primaryFuelType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      secondaryFuelType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addColumn('Sightings', 'vehicleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Vehicles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Sightings', 'vehicleId');
    await queryInterface.dropTable('Vehicles');
  }
};
