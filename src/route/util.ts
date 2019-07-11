import { RequestHandler } from "express";

/** Wrap a request handler to provide error-handling. */
export function handleError(fn: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch ({ message, name }) {
      res.status(500).json({ message, name });
    }
  };
}
