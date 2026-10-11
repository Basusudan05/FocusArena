import { Router } from 'express'
import auth from '../middleware/auth.js'
import { getGlobalLeaderboard } from '../controllers/leaderboardController.js'

const router = Router()

router.use(auth)
router.get('/leaderboard', getGlobalLeaderboard)

export default router
