import type { Request, Response, NextFunction } from "express";

type PrismaLikeError = Error & {
  code?: string;
  meta?: Record<string, unknown>;
};

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details || null,
    });
    return;
  }

  const prismaError = err as PrismaLikeError;

  if (prismaError.code === "P2002") {
    res.status(409).json({
      success: false,
      error: "Duplicate value violates unique constraint",
      details: prismaError.meta || null,
    });
    return;
  }

  if (prismaError.code === "P2025") {
    res.status(404).json({
      success: false,
      error: "Requested record was not found",
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
