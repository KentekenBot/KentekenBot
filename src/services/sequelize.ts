import { Sequelize } from 'sequelize';

export const sequelizeConnection = new Sequelize({
    storage: __dirname + '/../../kentekenbot.db',
    dialect: 'sqlite',
});
