import { unlink } from 'node:fs/promises';
import { type OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { assert } from '@x-document/assert.ts';
import { config } from '../../config.ts';
import { storage } from '../../document/storage.ts';
import { errorHandler, schema } from '../../server/errorHandler.ts';
import { ErrorCode } from '../../types/ErrorHandler.ts';

export const removeRoute = (endpoint: OpenAPIHono): void => {
	const route = createRoute({
		method: 'delete',
		path: '/{name}',
		tags: ['v1'],
		summary: 'Remove document',
		deprecated: true,
		request: {
			params: z.object({
				name: z.string().min(config.documentNameLengthMin).max(config.documentNameLengthMax).openapi({
					description: 'The document name',
					example: 'abc123'
				})
			}),
			headers: z.object({
				secret: z.string().min(1).openapi({
					description: 'The document secret',
					example: 'aaaaa-bbbbb-ccccc-ddddd'
				})
			})
		},
		responses: {
			200: {
				content: {
					'application/json': {
						schema: z.object({
							removed: z.boolean().openapi({
								description: 'Confirmation of deletion',
								example: true
							})
						})
					}
				},
				description: 'An object with a "removed" parameter of the deleted document'
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
			const headers = ctx.req.valid('header');

			assert.name(params.name);

			const document = await storage.read(params.name);

			assert.secret(headers.secret, document.header.secretHash);

			const result = await unlink(config.storagePath + params.name)
				.then(() => true)
				.catch(() => false);

			return ctx.json({ removed: result });
		},
		(result) => {
			if (!result.success) {
				return errorHandler.send(ErrorCode.validation);
			}
		}
	);
};
