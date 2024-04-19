import { unlink } from 'node:fs/promises';
import { t } from 'elysia';
import { AbstractEndpoint } from '../classes/AbstractEndpoint.ts';
import { ErrorHandler } from '../classes/ErrorHandler.ts';
import { Server } from '../classes/Server.ts';
import { DocumentUtils } from '../utils/DocumentUtils.ts';

export class RemoveV2 extends AbstractEndpoint {
	protected override run(): void {
		this.SERVER.elysia.delete(
			this.PREFIX.concat('/:name'),
			async ({ headers, params }) => {
				DocumentUtils.validateName(params.name);

				const file = await DocumentUtils.retrieveDocument(params.name);
				const document = await DocumentUtils.documentReadV1(file);

				DocumentUtils.validateSecret(headers.secret, document.header.secretHash);

				return {
					removed: await unlink(Server.DOCUMENT_PATH + params.name)
						.then(() => true)
						.catch(() => false)
				};
			},
			{
				params: t.Object({
					name: t.String({
						description: 'The document key',
						examples: ['abc123']
					})
				}),
				headers: t.Object({
					secret: t.String({
						description: 'The document secret',
						examples: ['aaaaa-bbbbb-ccccc-ddddd']
					})
				}),
				response: {
					200: t.Object(
						{
							removed: t.Boolean({
								description: 'A boolean indicating if the deletion was successful'
							})
						},
						{ description: 'A response object with a boolean' }
					),
					400: ErrorHandler.SCHEMA,
					403: ErrorHandler.SCHEMA,
					404: ErrorHandler.SCHEMA
				},
				detail: { summary: 'Remove document', tags: ['v2'] }
			}
		);
	}
}
