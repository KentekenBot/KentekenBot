import { Database } from 'sqlite3';
import { DateTime } from '../util/date-time';
import fs from 'fs';
import { Sighting } from '../types/sighting';

export class Sightings {
    private static db: Database;

    public static get(license: string): Promise<Sighting[]> {
        if (!this.db) {
            this.db = this.getDb();
        }

        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT *, (SELECT COUNT(*) FROM sightings WHERE license_plate = ? COLLATE NOCASE) AS count FROM sightings WHERE license_plate = ? COLLATE NOCASE ORDER BY date_time DESC LIMIT 10',
                [license, license],
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

    public static async list(license: string): Promise<string | null> {
        const sightingData = await Sightings.get(license);

        if (sightingData.length) {
            const sightings = [];
            const sightingCount = sightingData[0].count;

            sightingData.forEach((sighting) => {
                const timestamp = DateTime.getDiscordTimestamp(sighting.date_time);
                sightings.push(`<@${sighting.discord_user_id}> - ${timestamp}`);
            });

            if (sightingData.length == 10 && sightingCount > 10) {
                sightings.push(`En ${sightingCount - 10} andere ${sightingCount - 10 == 1 ? 'keer' : 'keren'} gespot.`);
            }

            return sightings.join('\n');
        }

        return null;
    }

    public static insert(license: string, author: string): void {
        const stmt = this.db.prepare('INSERT INTO sightings VALUES (?, ?, ?)');
        stmt.run(license, author, new Date().getTime());
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
