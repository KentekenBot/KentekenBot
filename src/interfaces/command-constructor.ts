import { ICommand } from './command';

export interface CommandConstructor {
    new (): ICommand;
}
