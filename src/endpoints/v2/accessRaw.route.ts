import { type OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { storage } from '@x-document/storage.ts';
import { config } from '../../config.ts';
import { compression } from '../../document/compression.ts';
import { validator } from '../../document/validator.ts';
import { errorHandler, schema } from '../../server/errorHandler.ts';
import { ErrorCode } from '../../types/ErrorHandler.ts';

export const accessRawRoute = (endpoint: OpenAPIHono): void => {
	const route = createRoute({
		method: 'get',
		path: '/{name}/raw',
		tags: ['v2'],
		summary: 'Get document data',
		request: {
			params: z.object({
				name: z.string().min(config.documentNameLengthMin).max(config.documentNameLengthMax).openapi({
					description: 'The document name',
					example: 'abc123'
				})
			}),
			headers: z.object({
				password: z.string().optional().openapi({
					description: 'The password to access the document',
					example: 'aabbccdd11223344'
				})
			}),
			query: z.object({
				p: z.string().optional().openapi({
					description:
						'The password to decrypt the document. It is preferred to pass the password through headers, only use this method for support of web browsers.',
					example: 'aabbccdd11223344'
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
			const headers = ctx.req.valid('header');
			const query = ctx.req.valid('query');

			const options = {
				password: headers.password || query.p
			};

			const document = await storage.read(params.name);

			if (document.header.passwordHash) {
				if (!options.password) {
					return errorHandler.send(ErrorCode.documentPasswordNeeded);
				}

				validator.validatePassword(options.password, document.header.passwordHash);
			}

			// @ts-ignore: Return the buffer directly
			return ctx.text(compression.decode(document.data));
		},
		(result) => {
			if (!result.success) {
				return errorHandler.send(ErrorCode.validation);
			}
		}
	);
};
