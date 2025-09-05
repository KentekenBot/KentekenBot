import { DataTypes, Model, Optional } from 'sequelize';
import { sequelizeConnection } from '../services/sequelize';
import { Sighting } from './sighting';

interface VehicleAttributes {
    id: number;
    createdAt?: Date;
    updatedAt?: Date;
    dateFirstAllowed: Date | null;
    dateFirstRegistration: Date | null;
    license?: string;
    brand: string | null;
    tradeName: string | null;
    price: number | null;
    vehicleType: string | null;
    interiorType: string | null;
    color: string | null;
    totalHorsepower: string | null;
    primaryFuelType: string | null;
    secondaryFuelType: string | null;
    country: string;
}
export type UserInput = Optional<VehicleAttributes, 'id'>;

export class Vehicle extends Model<VehicleAttributes, UserInput> implements VehicleAttributes {
    declare id: number;
    declare createdAt: Date;
    declare updatedAt: Date;
    declare dateFirstAllowed: Date;
    declare dateFirstRegistration: Date;
    declare license: string;
    declare brand: string | null;
    declare tradeName: string | null;
    declare price: number | null;
    declare vehicleType: string | null;
    declare interiorType: string | null;
    declare color: string | null;
    declare totalHorsepower: string | null;
    declare primaryFuelType: string | null;
    declare secondaryFuelType: string | null;
    declare country: string;

    static associate() {
        Vehicle.hasMany(Sighting, {
            foreignKey: 'vehicleId',
            as: 'sightings',
        });
    }
}

Vehicle.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        dateFirstAllowed: {
            allowNull: true,
            type: DataTypes.DATE,
        },
        dateFirstRegistration: {
            allowNull: true,
            type: DataTypes.DATE,
        },
        license: {
            type: DataTypes.STRING,
        },
        brand: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        tradeName: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        price: {
            allowNull: true,
            type: DataTypes.NUMBER,
        },
        vehicleType: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        interiorType: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        color: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        totalHorsepower: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        primaryFuelType: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        secondaryFuelType: {
            allowNull: true,
            type: DataTypes.STRING,
        },
        country: {
            allowNull: false,
            type: DataTypes.STRING,
        },
    },
    {
        timestamps: true,
        sequelize: sequelizeConnection,
    }
);
