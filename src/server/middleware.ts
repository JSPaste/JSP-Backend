import { env } from '@x-util/env.ts';
import { bodyLimit as middlewareBodyLimit } from 'hono/body-limit';
import { ErrorCode } from '../types/ErrorHandler.ts';
import { errorHandler } from './errorHandler.ts';

export const middleware = {
	bodyLimit: (maxSize: number = env.documentMaxSize) => {
		return middlewareBodyLimit({
			maxSize: maxSize * 1024,
			onError: () => {
				throw errorHandler.send(ErrorCode.documentInvalidSize);
			}
		});
	}
} as const;
