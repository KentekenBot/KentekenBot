import { DataTypes, Model, Optional } from 'sequelize';
import { sequelizeConnection } from '../services/sequelize';

interface SightingAttributes {
    id: number;
    license?: string;
    discordUserId?: string;
    discordGuildId?: string;
    updatedAt?: Date;
    createdAt?: Date;
}
export type UserInput = Optional<SightingAttributes, 'id'>;

export class Sighting extends Model<SightingAttributes, UserInput> implements SightingAttributes {
    createdAt!: Date;
    discordUserId!: string;
    discordGuildId!: string;
    license!: string;
    id!: number;
    updatedAt!: Date;
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

Sighting.sync();
