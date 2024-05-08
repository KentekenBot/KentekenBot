import { get } from 'https';

export class Heartbeat {
    public constructor(private endpoint: string, intervalInMs: number) {
        this.beat();
        setInterval(this.beat.bind(this), intervalInMs);
    }

    private beat(): void {
        get(this.endpoint, (res) => {
            const { statusCode } = res;
            if (statusCode !== 200) {
                console.error('Hearbeat failed');
            }
        });
    }
}
