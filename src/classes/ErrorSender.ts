import { type Context, error } from 'elysia';

interface IError {
	type: 'error';
	message: string;
	errorCode: string;
}

export class ErrorSender {
	context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	sendError(code: number, err: IError) {
		return error(code, err);
	}

	static isError(error?: IError) {
		return error?.type === 'error';
	}

	static isElysiaError(err?: any): boolean {
		if (!err) return false;

		return (
			err.response &&
			'type' in (err.response as IError) &&
			(err.response as IError).type === 'error'
		);
	}
}