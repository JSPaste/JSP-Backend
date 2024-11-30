import { deserialize, serialize } from 'bun:jsc';
import { logger } from '@x-util/logger.ts';
import { config } from '../config.ts';
import { errorHandler } from '../server/errorHandler.ts';
import type { Document } from '../types/Document.ts';
import { ErrorCode } from '../types/ErrorHandler.ts';

export const storage = {
	read: async (name: string): Promise<Document> => {
		const document = await Bun.file(config.storageDataPath + name)
			.arrayBuffer()
			.catch(() => errorHandler.send(ErrorCode.documentNotFound));

		try {
			if (document.byteLength <= 0) throw null;

			return deserialize(document);
		} catch {
			logger.error(`Document "${name}" is corrupted! Aborting...`);

			return errorHandler.send(ErrorCode.documentCorrupted);
		}
	},

	write: async (name: string, document: Document): Promise<void> => {
		await Bun.write(config.storageDataPath + name, serialize(document));
	}
} as const;
