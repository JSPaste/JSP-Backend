import type { Hono } from 'hono';
import { ErrorHandler } from '../../classes/ErrorHandler.ts';
import { ErrorCode } from '../../types/ErrorHandler.ts';
import { DocumentUtils } from '../../utils/DocumentUtils.ts';

import util from 'node:util';
import zlib from 'node:zlib';

const brotliDecompress = util.promisify(zlib.brotliDecompress);

export const accessRoute = (endpoint: Hono) => {
	endpoint.get('/:name', async (ctx) => {
		const params = ctx.req.param();

		const document = await DocumentUtils.documentReadV1(params.name);

		// V1 Endpoint does not support Server-Side Encryption
		if (document.header.passwordHash) {
			ErrorHandler.send(ErrorCode.documentPasswordNeeded);
		}

		return ctx.json({
			key: params.name,
			data: (await brotliDecompress(document.data)).toString('utf-8')
		});
	});
};