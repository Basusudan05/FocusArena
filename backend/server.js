import express from 'express'
import cors from 'cors'

import logger from './middleware/logger.js'
import testRoutes from './routes/testRoutes.js'
import userRoutes from './routes/userRoutes.js'
import groupRoutes from './routes/groupRoutes.js'
import sessionRoutes from './routes/sessionRoutes.js'
import leaderboardRoutes from './routes/leaderboardRoutes.js'

const app = express()

// --- Middleware ---
app.use(express.json())
app.use(cors())
app.use(logger)

// --- Routes ---
app.use('/api', testRoutes)
app.use('/api', userRoutes)
app.use('/api', groupRoutes)
app.use('/api', sessionRoutes)
app.use('/api', leaderboardRoutes)

// --- Start server ---
const PORT = process.env.PORT || 5000

// --- 404 handler for unmatched routes ---
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` })
})

// Global error handler — catches any unhandled errors thrown in route handlers
// Never expose stack traces or raw error messages in production
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[express] Unhandled error:', err.message)
  const isDev = process.env.NODE_ENV !== 'production'
  res.status(err.status ?? 500).json({
    error: isDev ? (err.message ?? 'Internal server error') : 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`FocusArena backend running on http://localhost:${PORT}`)
})
