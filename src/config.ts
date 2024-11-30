import { env } from './env.ts';

export const config = {
	apiPath: '/api',
	documentNameLengthDefault: 8,
	documentNameLengthMax: 32,
	documentNameLengthMin: 2,
	protocol: env.tls ? 'https://' : 'http://',
	storageDataPath: './storage/data/',
	storageDatabaseFile: './storage/database.db',
	storagePath: './storage/'
} as const;
