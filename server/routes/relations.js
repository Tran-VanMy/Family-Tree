// server/routes/relations.js
import express from 'express'
import * as ctrl from '../controllers/relationController.js'

const router = express.Router()

router.get('/', ctrl.getAll)
router.post('/', ctrl.create)
router.delete('/:id', ctrl.remove)

export default router
