import { type InputType, brotliCompressSync, brotliDecompressSync } from 'node:zlib';
import { constants as zlibConstants } from 'zlib';

export const compression = {
	encode: (data: InputType): Buffer => {
		return brotliCompressSync(data, {
			params: {
				[zlibConstants.BROTLI_PARAM_QUALITY]: 1,
				[zlibConstants.BROTLI_PARAM_LGWIN]: 24
			}
		});
	},

	decode: (data: InputType): Buffer => {
		return brotliDecompressSync(data);
	}
} as const;
