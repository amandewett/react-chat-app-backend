import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = req.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    status: false,
    message: err.message,
    stack: process.env.ENV === "Production" ? null : err.stack,
  });
};

export { errorHandler };
