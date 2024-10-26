import { LogLevels } from '@x-util/logger.ts';
import { get } from 'env-var';

export const env = {
	port: get('PORT').default(4000).asPortNumber(),
	logLevel: get('LOGLEVEL').default(LogLevels.info).asIntPositive(),
	tls: get('TLS').asBoolStrict() ?? true,
	documentMaxSize: get('DOCUMENT_MAXSIZE').default(1024).asIntPositive(),
	docsEnabled: get('DOCS_ENABLED').asBoolStrict() ?? false,
	docsPath: get('DOCS_PATH').default('/docs').asString()
} as const;
