// Last-resort handler. Never leak stack traces or raw error messages to the
// client -- log server-side, return a generic message.
export function errorHandler(err, req, res, _next) {
  console.error(err);
  res.status(500).json({ detail: "Internal server error." });
}
