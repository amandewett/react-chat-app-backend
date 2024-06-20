import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || 500;
  const errorMessage = err.message || `Internal server error`;

  res.status(statusCode).json({
    status: false,
    message: err.message,
    stack: process.env.ENV === "Production" ? null : err.stack,
  });
};

export { errorHandler };
