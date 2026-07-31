export class Output {
    public static line(text: string): void {
        console.log(text);
    }

    public static error(context: string, error: unknown): void {
        console.error(`${context}:`, error);
    }
}
