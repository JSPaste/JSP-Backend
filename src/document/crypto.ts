import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import { CryptoHasher } from 'bun';

const hasher = new CryptoHasher('blake2b256');
const saltLength = 16;

export const crypto = {
	hash: (password: string): Uint8Array => {
		const salt = randomBytes(saltLength);

		return Buffer.concat([salt, hasher.update(salt).update(password).digest()]);
	},

	compare: (password: string, hash: Uint8Array): boolean => {
		const salt = hash.subarray(0, saltLength);
		const computedHash = hasher.update(salt).update(password).digest();

		return computedHash.compare(hash.subarray(saltLength)) === 0;
	}
} as const;
