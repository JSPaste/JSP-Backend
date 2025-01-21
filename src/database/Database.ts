import { Database as SQLite } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { logger } from '@x-util/logger.ts';
import { config } from '../config.ts';
import { env } from '../env.ts';
import { shutdown } from '../server.ts';
import { map, migrations } from './migrations.ts';

export class Database {
	private readonly database: SQLite;

	public constructor() {
		// TODO: Move this out of the constructor
		if (!existsSync(config.storagePath)) {
			mkdirSync(config.storagePath);
		}

		this.database = new SQLite(env.debugDatabaseEphemeral ? undefined : config.storageDatabaseFile, {
			strict: true
		});

		this.migration();
	}

	public get instance(): SQLite {
		return this.database;
	}

	public close(graceful = true): void {
		this.database.close(!graceful);

		logger.debug('Database closed', graceful ? 'gracefully.' : 'forcefully.');
	}

	private migration(): void {
		const currentVersion = this.database
			.prepare<{ user_version: number }, null>('PRAGMA user_version')
			.get(null)?.user_version;

		if (currentVersion === undefined) {
			logger.error('Failed to get the current database version. Aborting...');

			shutdown(1);
			return;
		}

		const migrationEntries = Object.entries(migrations).map(
			([key, value]) => [Number(key), value] as [number, string]
		);

		if (currentVersion === migrationEntries.length) {
			logger.info('Database already up to date.');
			return;
		}

		if (currentVersion > migrationEntries.length) {
			logger.error(
				'Database version is higher than the available migrations. This might indicate that you are running an older version of the backend. Aborting...'
			);

			shutdown(1);
			return;
		}

		// TODO: Check for WAL files existence
		for (const [i, sql] of migrationEntries) {
			if (i > currentVersion) {
				try {
					this.database.transaction(() => {
						this.database.run(sql);
						this.database.run(`PRAGMA user_version = ${i}`);
					})();
				} catch (error) {
					logger.error(error);
					logger.error(`Error running migration "${map[i]}", database reverted to a prior state.`);

					shutdown(1);
					return;
				}

				logger.info(`Database migration "${map[i]}" ran successfully.`);
			}
		}
	}
}
