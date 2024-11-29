import { OpenAPIHono } from '@hono/zod-openapi';
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

process.on('SIGTERM', async () => await backend.stop());

logger.set(env.logLevel);

const instance = new OpenAPIHono().basePath(config.apiPath);

export const server = (): typeof instance => {
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
