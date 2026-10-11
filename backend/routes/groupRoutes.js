import { Router } from 'express'
import auth from '../middleware/auth.js'
import {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getGroupLeaderboard,
} from '../controllers/groupController.js'

const router = Router()

// All group routes require authentication
router.use(auth)

router.post('/groups', createGroup)
router.get('/groups', getMyGroups)
router.get('/groups/:id', getGroupById)
router.get('/groups/:id/leaderboard', getGroupLeaderboard)
router.post('/groups/:id/join', joinGroup)
router.delete('/groups/:id/leave', leaveGroup)

export default router
