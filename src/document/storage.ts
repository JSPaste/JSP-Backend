import { deserialize, serialize } from 'bun:jsc';
import { config } from '../config.ts';
import { errorHandler } from '../server/errorHandler.ts';
import type { Document } from '../types/Document.ts';
import { ErrorCode } from '../types/ErrorHandler.ts';

export const storage = {
	read: async (name: string): Promise<Document> => {
		try {
			return deserialize(await Bun.file(config.storagePath + name).arrayBuffer());
		} catch {
			return errorHandler.send(ErrorCode.documentNotFound);
		}
	},

	write: async (name: string, document: Document): Promise<void> => {
		await Bun.write(config.storagePath + name, serialize(document));
	}
} as const;
