export abstract class BaseModel {
    protected hydrate(data): void {
        for (const key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}
