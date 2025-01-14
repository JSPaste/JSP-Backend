import { LogLevels } from '@x-util/logger.ts';
import { get } from 'env-var';

export const env = {
	debugDatabaseEphemeral: get('DEBUG_DATABASE_EPHEMERAL').asBoolStrict() ?? false,
	documentCompression: get('DOCUMENT_COMPRESSION').default('brotli').asEnum(['none', 'deflate', 'brotli']),
	documentCompressionBrotliLevel: get('DOCUMENT_COMPRESSION_BROTLI_LEVEL').default(1).asIntPositive(), // FIXME: Check ranges
	documentCompressionDeflateLevel: get('DOCUMENT_COMPRESSION_DEFLATE_LEVEL').default(1).asIntPositive(), // FIXME: Check ranges
	documentMaxSize: get('DOCUMENT_MAXSIZE').default(1024).asIntPositive(),
	logLevel: get('LOGLEVEL').default(LogLevels.info).asIntPositive(), // FIXME: Check ranges
	port: get('PORT').default(4000).asPortNumber(),
	tls: get('TLS').asBoolStrict() ?? true
} as const;
