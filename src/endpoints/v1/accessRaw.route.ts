import { type OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { assert } from '@x-document/assert.ts';
import { ErrorCode } from '@x-type/ErrorHandler.ts';
import { config } from '../../config.ts';
import { compression } from '../../document/compression.ts';
import { storage } from '../../document/storage.ts';
import { errorHandler, schema } from '../../server/errorHandler.ts';

export const accessRawRoute = (endpoint: OpenAPIHono): void => {
	const route = createRoute({
		method: 'get',
		path: '/{name}/raw',
		tags: ['v1'],
		summary: 'Get document data',
		deprecated: true,
		request: {
			params: z.object({
				name: z.string().min(config.documentNameLengthMin).max(config.documentNameLengthMax).openapi({
					description: 'The document name',
					example: 'abc123'
				})
			})
		},
		responses: {
			200: {
				content: {
					'text/plain': {
						schema: z.any().openapi({
							description: 'The document data'
						}),
						example: 'Hello, World!'
					}
				},
				description: 'The document data'
			},
			400: schema,
			404: schema,
			500: schema
		}
	});

	endpoint.openapi(
		route,
		async (ctx) => {
			const params = ctx.req.valid('param');

			assert.name(params.name);

			const document = await storage.read(params.name);

			// V1 Endpoint does not support document protected password
			if (document.header.passwordHash) {
				return errorHandler.send(ErrorCode.documentPasswordNeeded);
			}

			// @ts-ignore: Return the document data directly
			return ctx.text(compression.decode(document.data) ?? document.data);
		},
		(result) => {
			if (!result.success) {
				return errorHandler.send(ErrorCode.validation);
			}
		}
	);
};
