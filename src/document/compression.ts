import { Buffer } from 'node:buffer';
import {
	type InputType,
	brotliCompressSync,
	brotliDecompressSync,
	deflateSync,
	inflateSync,
	constants as zlibConstants
} from 'node:zlib';
import { errorHandler } from '@x-server/errorHandler.ts';
import { env } from '../env.ts';
import { ErrorCode } from '../types/ErrorHandler.ts';

enum CompressionByte {
	none = 0x00,
	deflate = 0x11,
	gzip = 0x12,
	brotli = 0x13
}

export const compression = {
	encode: (data: InputType): Buffer | null => {
		if (env.documentCompression === 'none') return null;

		// head byte, compressor byte, reserved byte, tail byte
		const identifier = Buffer.from([0xba, CompressionByte[env.documentCompression], 0xff, 0xca]);

		switch (env.documentCompression) {
			case 'deflate': {
				return Buffer.concat([
					identifier,
					deflateSync(data, {
						level: env.documentCompressionDeflateLevel
					})
				]);
			}
			case 'brotli': {
				return Buffer.concat([
					identifier,
					brotliCompressSync(data, {
						params: {
							[zlibConstants.BROTLI_PARAM_QUALITY]: env.documentCompressionBrotliLevel,
							[zlibConstants.BROTLI_PARAM_LGWIN]: 24
						}
					})
				]);
			}
		}
	},

	decode: (data: string | Uint8Array): Buffer | null => {
		if (data[0] === 0xba && data[3] === 0xca) {
			switch (data[1]) {
				case CompressionByte.deflate: {
					return inflateSync(data.slice(4));
				}
				case CompressionByte.brotli: {
					return brotliDecompressSync(data.slice(4));
				}
				// Unknown compression type
				default: {
					return errorHandler.send(ErrorCode.documentCorrupted);
				}
			}
		}

		return null;
	}
} as const;
