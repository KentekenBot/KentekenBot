import { Bot } from './bot';
import { sequelizeConnection } from './services/sequelize';
import './models';

sequelizeConnection
    .authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch((error: Error) => {
        console.error('Unable to connect to the database:', error);
    });

new Bot().liftOff();
