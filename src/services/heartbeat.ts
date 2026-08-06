import { get } from 'https';

export class Heartbeat {
    public constructor(
        private endpoint: string,
        intervalInMs: number
    ) {
        this.beat();
        setInterval(this.beat.bind(this), intervalInMs);
    }

    // A malformed endpoint makes get() throw synchronously; that must not take
    // down whoever constructed the heartbeat.
    private beat(): void {
        try {
            get(this.endpoint, (res) => {
                const { statusCode } = res;
                if (statusCode !== 200) {
                    console.error(`Hearbeat failed: status ${statusCode}`);
                }
            }).on('error', (error) => {
                console.error(`Heartbeat failed: ${error}`);
            });
        } catch (error) {
            console.error(`Heartbeat failed: ${error}`);
        }
    }
}
