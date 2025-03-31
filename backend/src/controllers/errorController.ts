import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  stack?: string;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    //err.message berasal dari object Error js
    message: err.message,
    stack: err.stack,
  });
};

export default errorHandler;
