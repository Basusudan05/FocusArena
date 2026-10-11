// Express Router groups related routes together
// This keeps server.js clean — it just mounts routers, not individual routes

import { Router } from 'express'
import { getTest } from '../controllers/testController.js'

const router = Router()

router.get('/test', getTest)

export default router
