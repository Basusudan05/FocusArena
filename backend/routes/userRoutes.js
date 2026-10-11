import { Router } from 'express'
import auth from '../middleware/auth.js'
import { getUsers, getProfileById, upsertProfile } from '../controllers/userController.js'

const router = Router()

// All profile routes require authentication
router.use(auth)

router.get('/profiles', getUsers)
router.get('/profiles/:id', getProfileById)
router.put('/profiles/:id', upsertProfile)

export default router
