import { DataTypes, Model, Optional } from 'sequelize';
import { sequelizeConnection } from '../services/sequelize';
import { Vehicle } from './vehicle';

interface SightingAttributes {
    id: number;
    vehicleId: number | null;
    license?: string;
    discordUserId?: string;
    discordGuildId?: string;
    discordChannelId?: string;
    discordInteractionId?: string;
    updatedAt?: Date;
    createdAt?: Date;
    comment: string | null;
}
export type UserInput = Optional<SightingAttributes, 'id'>;

export class Sighting extends Model<SightingAttributes, UserInput> implements SightingAttributes {
    declare createdAt: Date;
    declare discordUserId: string;
    declare discordGuildId: string;
    declare discordChannelId: string;
    declare discordInteractionId: string;
    declare license: string;
    declare id: number;
    declare vehicleId: number;
    declare updatedAt: Date;
    declare comment: string | null;
    declare vehicle?: Vehicle;

    static associate() {
        Sighting.belongsTo(Vehicle, {
            foreignKey: 'vehicleId',
            as: 'vehicle',
        });
    }
}

Sighting.init(
    {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        vehicleId: {
            allowNull: true,
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
        discordChannelId: {
            type: DataTypes.STRING,
        },
        discordInteractionId: {
            type: DataTypes.STRING,
        },
        comment: {
            allowNull: true,
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
    },
    {
        timestamps: true,
        sequelize: sequelizeConnection,
    }
);
