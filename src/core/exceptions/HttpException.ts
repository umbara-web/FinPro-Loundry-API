export class HttpException extends Error {
  public status: number;
  public message: string;
  public isOperational: boolean;

  constructor(status: number, message: string, isOperational = true) {
    super(message);
    this.status = status;
    this.message = message;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, HttpException.prototype);
  }
}
