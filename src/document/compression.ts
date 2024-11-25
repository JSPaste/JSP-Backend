import { type InputType, brotliCompressSync, brotliDecompressSync, constants as zlibConstants } from 'node:zlib';

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
