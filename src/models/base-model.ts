export abstract class BaseModel {
    protected hydrate(data: Record<string, unknown>): void {
        for (const [key, value] of Object.entries(data)) {
            if (this.hasOwnProperty(key)) {
                (<Record<string, unknown>>this)[key] = value
            }
        }
    }
}
