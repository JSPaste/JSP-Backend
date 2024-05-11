import { unlink } from 'node:fs/promises';
import type { Hono } from 'hono';
import { Server } from '../../classes/Server.ts';
import { DocumentUtils } from '../../utils/DocumentUtils.ts';

export const removeRoute = (endpoint: Hono) => {
	endpoint.delete('/:name', async (ctx) => {
		const params = ctx.req.param();

		const headers = {
			secret: ctx.req.header('secret')
		};

		const document = await DocumentUtils.documentReadV1(params.name);

		DocumentUtils.validateSecret(headers.secret, document.header.secretHash);

		return ctx.json({
			removed: await unlink(Server.DOCUMENT_PATH + params.name)
				.then(() => true)
				.catch(() => false)
		});
	});
};