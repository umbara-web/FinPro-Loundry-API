import { HttpException } from './HttpException';

export class NotFoundError extends HttpException {
  constructor(message: string = 'Resource Not Found') {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
