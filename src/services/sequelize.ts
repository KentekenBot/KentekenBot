import { Options, Sequelize } from 'sequelize';
import config from '../../config.json';

export const sequelizeConnection = new Sequelize(config as Options);
