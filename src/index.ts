import { Bot } from './bot';
import { sequelizeConnection } from './services/sequelize';
import { Output } from './services/output';
import './models';

// A last line of defence. Node terminates the process on an unhandled rejection,
// and a bot that has answered thousands of interactions should not die because one
// of them was already gone.
process.on('unhandledRejection', function (reason: unknown): void {
    Output.error('Unhandled rejection', reason);
});

sequelizeConnection
    .authenticate()
    .then(() => {
        console.log('Database connection has been established successfully.');
    })
    .catch((error: Error) => {
        console.error('Unable to connect to the database:', error);
    });

new Bot().liftOff();
