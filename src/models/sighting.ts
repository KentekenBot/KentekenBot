import { DataTypes, Model, Optional } from 'sequelize';
import { sequelizeConnection } from '../services/sequelize';

interface SightingAttributes {
    id: number;
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
    createdAt!: Date;
    discordUserId!: string;
    discordGuildId!: string;
    discordChannelId!: string;
    discordInteractionId!: string;
    license!: string;
    id!: number;
    updatedAt!: Date;
    comment!: string | null;
}

Sighting.init(
    {
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
