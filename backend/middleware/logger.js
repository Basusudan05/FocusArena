// Logger middleware runs on every incoming request before it hits a route
// req.method = GET, POST, etc.
// req.url = the path being requested, e.g. /api/test

const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next() // Pass control to the next middleware or route handler
}

export default logger
