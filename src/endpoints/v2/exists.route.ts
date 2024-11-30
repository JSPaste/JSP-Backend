import { type OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { assert } from '@x-document/assert.ts';
import { ErrorCode } from '@x-type/ErrorHandler.ts';
import { config } from '../../config.ts';
import { errorHandler, schema } from '../../server/errorHandler.ts';

export const existsRoute = (endpoint: OpenAPIHono): void => {
	const route = createRoute({
		method: 'get',
		path: '/{name}/exists',
		tags: ['v2'],
		summary: 'Check document',
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
						schema: z.string().openapi({
							description: 'The document existence result'
						}),
						examples: {
							true: {
								summary: 'Document exists',
								value: 'true'
							},
							false: {
								summary: 'Document does not exist',
								value: 'false'
							}
						}
					}
				},
				description: 'The document existence result'
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

			return ctx.text(String(await Bun.file(config.storageDataPath + params.name).exists()));
		},
		(result) => {
			if (!result.success) {
				return errorHandler.send(ErrorCode.validation);
			}
		}
	);
};
