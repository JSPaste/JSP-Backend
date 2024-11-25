import { validator } from '@x-util/validator.ts';
import { config } from '../config.ts';
import type { Range } from '../types/Range.ts';

const base64url = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

export const string = {
	createName: async (length: number = config.documentNameLengthDefault): Promise<string> => {
		const key = string.generateName(length);

		return (await string.nameExists(key)) ? string.createName(length + 1) : key;
	},

	createSecret: (chunkLength = 5, chunks = 4): string => {
		return Array.from({ length: chunks }, () => string.random(chunkLength)).join('-');
	},

	generateName: (length: number = config.documentNameLengthDefault): string => {
		if (!validator.isLengthWithinRange(length, config.documentNameLengthMin, config.documentNameLengthMax)) {
			length = config.documentNameLengthDefault;
		}

		return string.random(length, 64);
	},

	nameExists: (name: string): Promise<boolean> => {
		return Bun.file(config.storagePath + name).exists();
	},

	random: (length: number, base: Range<2, 64> = 62): string => {
		const baseSet = base64url.slice(0, base);
		let string = '';

		while (length--) string += baseSet.charAt(Math.floor(Math.random() * baseSet.length));

		return string;
	}
} as const;
