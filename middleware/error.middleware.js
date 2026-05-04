import BaseError from "../errors/base.error.js";

export default function (err, req, res, next) {
  if (err instanceof BaseError) {
    return res.status(err.status || 400).json({ message: err.message, errors: err.errors });
  }
  return res.status(err.status || 500).json({ message: err.message });
}
