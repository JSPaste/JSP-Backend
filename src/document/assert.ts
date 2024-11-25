import { validator } from '@x-util/validator.ts';
import { config } from '../config.ts';
import { errorHandler } from '../server/errorHandler.ts';
import type { Document } from '../types/Document.ts';
import { ErrorCode } from '../types/ErrorHandler.ts';
import { crypto } from './crypto.ts';

export const assert = {
	name: (name: string): void => {
		if (
			!validator.isBase64URL(name) ||
			!validator.isLengthWithinRange(
				Bun.stringWidth(name),
				config.documentNameLengthMin,
				config.documentNameLengthMax
			)
		) {
			errorHandler.send(ErrorCode.documentInvalidName);
		}
	},

	nameLength: (length?: number): void => {
		if (
			length &&
			!validator.isLengthWithinRange(length, config.documentNameLengthMin, config.documentNameLengthMax)
		) {
			errorHandler.send(ErrorCode.documentInvalidNameLength);
		}
	},

	password: (password: string, dataHash: Document['header']['passwordHash']): void => {
		if (dataHash && !crypto.compare(password, dataHash)) {
			errorHandler.send(ErrorCode.documentInvalidPassword);
		}
	},

	passwordLength: (password?: string): void => {
		if (
			password &&
			(validator.isEmptyString(password) || !validator.isLengthWithinRange(Bun.stringWidth(password), 1, 255))
		) {
			errorHandler.send(ErrorCode.documentInvalidPasswordLength);
		}
	},

	secret: (secret: string, secretHash: Document['header']['secretHash']): void => {
		if (!crypto.compare(secret, secretHash)) {
			errorHandler.send(ErrorCode.documentInvalidSecret);
		}
	},

	secretLength: (secret: string): void => {
		if (!validator.isLengthWithinRange(Bun.stringWidth(secret), 1, 255)) {
			errorHandler.send(ErrorCode.documentInvalidSecretLength);
		}
	}
} as const;
