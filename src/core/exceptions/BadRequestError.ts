import { HttpException } from './HttpException';

export class BadRequestError extends HttpException {
  constructor(message: string = 'Bad Request') {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
