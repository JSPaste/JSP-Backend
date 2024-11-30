import { OpenAPIHono } from '@hono/zod-openapi';
import { Database } from '@x-db/Database.ts';
import { oas } from '@x-server/oas.ts';
import { logger } from '@x-util/logger.ts';
import { serve } from 'bun';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { config } from './config.ts';
import { env } from './env.ts';
import { endpoints } from './server/endpoints.ts';
import { errorHandler } from './server/errorHandler.ts';
import { ErrorCode } from './types/ErrorHandler.ts';

logger.set(env.logLevel);

export const database = new Database();

export const server = (): typeof instance => {
	const instance = new OpenAPIHono().basePath(config.apiPath);

	instance.use('*', cors());

	instance.onError((error) => {
		if (error instanceof HTTPException) {
			return error.getResponse();
		}

		logger.error(error);

		return errorHandler.send(ErrorCode.unknown);
	});

	instance.notFound((ctx) => {
		return ctx.body(null, 404);
	});

	oas(instance);
	endpoints(instance);

	logger.info(`Listening on: http://localhost:${env.port}`);

	return instance;
};

const backend = serve({
	fetch: server().fetch,
	port: env.port
});

/**
 * @remarks This MUST be synchronous
 */
export const shutdown = (code = 0, fastStop = false): never => {
	/* FIXME: Something loops and makes the process hang forever
    backend.stop(fastStop).finally(() => {
        logger.debug('Backend closed.');

        database.close();

        logger.info('Bye.');
        process.exit(code);
    });
     */

	backend.stop(fastStop);
	logger.debug('Backend closed.');

	database.close();

	logger.info('Bye.');
	process.exit(code);
};

// TODO: Test with container
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
