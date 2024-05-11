import type { Hono } from 'hono';
import { ErrorHandler } from '../../classes/ErrorHandler.ts';
import { ErrorCode } from '../../types/ErrorHandler.ts';
import { DocumentUtils } from '../../utils/DocumentUtils.ts';

import util from 'node:util';
import zlib from 'node:zlib';

const brotliDecompress = util.promisify(zlib.brotliDecompress);

export const accessRawRoute = (endpoint: Hono) => {
	endpoint.get('/:name/raw', async (ctx) => {
		const params = ctx.req.param();

		DocumentUtils.validateName(params.name);

		const document = await DocumentUtils.documentReadV1(params.name);

		// V1 Endpoint does not support Server-Side Encryption
		if (document.header.passwordHash) {
			ErrorHandler.send(ErrorCode.documentPasswordNeeded);
		}

		ctx.header('Content-Type', 'text/plain;charset=utf-8');

		return ctx.body(await brotliDecompress(document.data));
	});
};