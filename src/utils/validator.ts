export const validator = {
	isBase64URL: (value: string): boolean => {
		return /^[\w-]+$/.test(value);
	},

	isDomain: (value: string): boolean => {
		return /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/.test(value);
	},

	isEmptyString: (value: string): boolean => {
		return value.trim().length === 0;
	},

	isInstanceOf: <T>(value: unknown, type: new (...args: any[]) => T): value is T => {
		return value instanceof type;
	},

	isLengthWithinRange: (value: number, min: number, max: number): boolean => {
		return value >= min && value <= max;
	},

	isTypeOf: <T>(value: unknown, type: string): value is T => {
		// biome-ignore lint/suspicious/useValidTypeof: We are checking the type of the value
		return typeof value === type;
	},

	isValidArray: <T>(value: T[], validator: (value: T) => boolean): boolean => {
		return Array.isArray(value) && value.every(validator);
	}
} as const;
