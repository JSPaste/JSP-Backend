import { AbstractEndpoint } from '../classes/AbstractEndpoint.ts';
import { type Elysia, t } from 'elysia';
import { DocumentHandler } from '../classes/DocumentHandler.ts';
import { ServerVersion } from '../types/Server.ts';
import { JSPError } from '../classes/JSPError.ts';

export class AccessV2 extends AbstractEndpoint {
	public constructor(server: Elysia) {
		super(server);
	}

	public override register(prefix: string): void {
		const hook = {
			params: t.Object({
				key: t.String({
					description: 'The document key',
					examples: ['abc123']
				})
			}),
			headers: t.Optional(
				t.Object({
					password: t.Optional(
						t.String({
							description: 'The document password if aplicable',
							examples: ['abc123']
						})
					)
				})
			),
			query: t.Optional(
				t.Object({
					p: t.Optional(
						t.String({
							description:
								'The document password if aplicable, It is preferred to pass the password through headers, only use this method for support of web browsers.',
							examples: ['aaaaa-bbbbb-ccccc-ddddd']
						})
					)
				})
			),
			response: {
				200: t.Object(
					{
						key: t.String({
							description: 'The key of the document',
							examples: ['abc123']
						}),
						data: t.String({
							description: 'The document',
							examples: ['Hello world']
						}),
						url: t.Optional(
							t.String({
								description: 'The URL for viewing the document on the web',
								examples: ['https://jspaste.eu/abc123']
							})
						),
						expirationTimestamp: t.Optional(
							t.Number({
								description:
									'UNIX timestamp with the expiration date in milliseconds. Undefined if the document is permanent.',
								examples: [60, 0]
							})
						)
					},
					{
						description:
							'The document object, including the key, the data, the display URL and an expiration timestamp for the document'
					}
				),
				400: JSPError.errorSchema,
				404: JSPError.errorSchema
			},
			detail: { summary: 'Get document', tags: ['v2'] }
		};

		this.server.get(
			prefix.concat('/:key'),
			async ({ set, request, query: { p }, params: { key } }) =>
				DocumentHandler.handleAccess(
					set,
					{
						key,
						password: request.headers.get('password') || p || ''
					},
					ServerVersion.v2
				),
			hook
		);
	}
}