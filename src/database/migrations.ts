export enum map {
	initialConfig_0001 = 1,
	initial_0002 = 2
}

/**
 * @remarks Keep the migrations in reverse order by their version number.
 */
export const migrations: { [migration: number]: string } = {
	/**
	 * @experimental May be subject to change
	 */
	[map.initial_0002]: `
        CREATE TABLE user
        (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            token       TEXT,
            created_at  TEXT,
            accessed_at TEXT
        ) STRICT;

        CREATE TABLE document
        (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER,
            version     INTEGER,
            name        TEXT,
            password    TEXT,
            created_at  TEXT,
            accessed_at TEXT,
            FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE
        ) STRICT;
    `,

	/**
	 * @experimental May be subject to change
	 */
	[map.initialConfig_0001]: `
		PRAGMA journal_mode = WAL;
		PRAGMA foreign_keys = ON;
	`
} as const;
