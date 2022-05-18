import { Database } from 'sqlite3';
import { DateTime } from '../util/date-time';
import fs from 'fs';

export class Sightings {
    private static db: Database;

    public static get(licence: string): Promise<Record<string, unknown>[]> {
        if (!this.db) {
            this.db = this.getDb();
        }

        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT *, (SELECT COUNT(*) FROM sightings WHERE license_plate = ? COLLATE NOCASE) AS count FROM sightings WHERE license_plate = ? COLLATE NOCASE ORDER BY date_time DESC LIMIT 10',
                [licence, licence],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    public static async list(licence: string): Promise<string | null> {
        const sightingData = await Sightings.get(licence);

        if (sightingData.length) {
            const sightings = [];
            const sightingCount = sightingData[0].count as number;

            sightingData.forEach((sighting) => {
                const dateTime = sighting.date_time;
                const sightingAt = DateTime.timeSince(new Date(parseInt(dateTime as string)));
                sightings.push(`<@${sighting.discord_user_id}> - ${sightingAt}`);
            });

            if (sightingData.length == 10 && sightingCount > 10) {
                sightings.push(`En ${sightingCount - 10} andere ${sightingCount - 10 == 1 ? 'keer' : 'keren'} gespot.`);
            }

            return sightings.join('\n');
        }

        return null;
    }

    public static insert(licence: string, author: string): void {
        const stmt = this.db.prepare('INSERT INTO sightings VALUES (?, ?, ?)');
        stmt.run(licence, author, new Date().getTime());
        stmt.finalize();
    }

    private static getDb(): Database {
        const fileName = __dirname + '/../../kentekenbot.db';
        if (!fs.existsSync(fileName)) {
            throw new Error('Unable to load database, no such file.');
        }
        const db = new Database(fileName);
        this.ensureTableExists(db);

        return db;
    }

    private static ensureTableExists(db: Database): void {
        db.run(
            'CREATE TABLE IF NOT EXISTS sightings (license_plate TEXT NOT NULL, discord_user_id TEXT NOT NULL, date_time TEXT NOT NULL UNIQUE);'
        );
    }
}
