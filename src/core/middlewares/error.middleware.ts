import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';

export const errorMiddleware = (
  err: Error | HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpException) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
