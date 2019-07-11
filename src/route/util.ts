import { RequestHandler } from "express";

/** Wrap a request handler to provide error-handling. */
export function handleError(fn: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      res.status(500).json(e);
    }
  };
}
