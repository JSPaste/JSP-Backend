import { database } from '../server.ts';

// TODO: Remove this when other queries are implemented
export const databaseVersion = {
	get: (): number | undefined => {
		return database.instance.prepare<{ user_version: number }, null>('PRAGMA user_version').get(null)?.user_version;
	},

	set: (version: number): void => {
		database.instance.run(`PRAGMA user_version = ${version}`);
	}
};
