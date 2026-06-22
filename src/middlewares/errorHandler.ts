import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(`[Error]: ${err.message || 'Unexpected Error'}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    message,
    //leak stack trace if we are developing
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

//basic 404 handler for unknown routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};