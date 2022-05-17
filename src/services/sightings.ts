import { Database } from "sqlite3";

export class Sightings {
    private static db: Database;

    public static get(licence: string): Promise<Record<string, unknown>[]> {
        if (!this.db) {
            this.db = this.getDb()
        }

        return new Promise((resolve, reject) => {
            this.db.all('SELECT *, (SELECT COUNT(*) FROM sightings WHERE license_plate = ? COLLATE NOCASE) AS count FROM sightings WHERE license_plate = ? COLLATE NOCASE ORDER BY date_time DESC LIMIT 10', [licence, licence], (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    public static insert(licence: string, author: string): void {
        const stmt = this.db.prepare("INSERT INTO sightings VALUES (?, ?, ?)");
        stmt.run(licence, author, new Date().getTime());
        stmt.finalize();
    }

    private static getDb(): Database {
        const db =  new Database(__dirname + '/../../kentekenbot.db');
        this.ensureTableExists(db);

        return db;
    }

    private static ensureTableExists(db: Database): void {
        db.run("CREATE TABLE IF NOT EXISTS sightings (license_plate TEXT NOT NULL, discord_user_id TEXT NOT NULL, date_time TEXT NOT NULL UNIQUE);");
    }
}
