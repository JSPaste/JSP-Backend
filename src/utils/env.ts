import { LogLevels } from '@x-util/logger.ts';
import { get } from 'env-var';

export const env = {
	documentMaxSize: get('DOCUMENT_MAXSIZE').default(1024).asIntPositive(),
	logLevel: get('LOGLEVEL').default(LogLevels.info).asIntPositive(),
	port: get('PORT').default(4000).asPortNumber(),
	tls: get('TLS').asBoolStrict() ?? true
} as const;
