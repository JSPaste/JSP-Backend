import { randomString } from './randomString.ts';

export function createSecret(chunkLength: number = 5, chunks: number = 4): string {
	const secret = Array.from({ length: chunks }, () => randomString(chunkLength));

	return secret.join('-');
}