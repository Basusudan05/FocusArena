import { Router } from 'express'
import auth from '../middleware/auth.js'
import { createSession, getSessions } from '../controllers/sessionController.js'

const router = Router()

// All session routes require authentication
router.use(auth)

router.post('/study-sessions', createSession)
router.get('/study-sessions', getSessions)

export default router
