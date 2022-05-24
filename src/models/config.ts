import { Dialect, Sequelize } from 'sequelize';

export const sequelizeConnection = new Sequelize({
    storage: __dirname + '/../../kentekenbot_migrated.db',
    dialect: 'sqlite',
});
