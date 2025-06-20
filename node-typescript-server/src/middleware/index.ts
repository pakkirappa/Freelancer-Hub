import { Request, Response, NextFunction } from "express";
import appLogger from "../utils/Logger";

// Request Logger Middleware with detailed logging
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // Log request details
  appLogger.info({
    requestId,
    type: "REQUEST",
    method: req.method,
    path: req.originalUrl,
    body: req.body,
    query: req.query,
    // headers: req.headers,
    timestamp: new Date().toISOString(),
  });

  // Log response details
  res.on("finish", () => {
    const duration = Date.now() - start;
    appLogger.info({
      requestId,
      type: "RESPONSE",
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

// Error Handler Middleware with structured logging
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorId = Math.random().toString(36).substring(7);

  appLogger.error({
    errorId,
    type: "ERROR",
    method: req.method,
    path: req.originalUrl,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    timestamp: new Date().toISOString(),
  });

  res.status(500).json({
    error: "Internal Server Error",
    errorId,
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

// Validation Error Handler
export const validationErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "ValidationError") {
    appLogger.warn({
      type: "VALIDATION_ERROR",
      method: req.method,
      path: req.originalUrl,
      errors: err.errors,
      timestamp: new Date().toISOString(),
    });

    return res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
  }
  next(err);
};

// Export all middleware functions
export default {
  requestLogger,
  errorHandler,
  validationErrorHandler,
};
