import { Bot } from './bot';
import { sequelizeConnection } from './services/sequelize';
import './models'; // This will ensure models are imported and associations are set up

sequelizeConnection
    .authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch((error: Error) => {
        console.error('Unable to connect to the database:', error);
    });

new Bot().liftOff();
