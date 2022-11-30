import { Options, Sequelize } from 'sequelize';
import config from '../../database/config.json';

export const sequelizeConnection = new Sequelize(config as Options);
