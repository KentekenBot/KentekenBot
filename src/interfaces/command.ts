export interface ICommand {
    handle(): void|Promise<void>;
}
