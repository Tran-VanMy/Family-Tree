// server/routes/persons.js
import express from 'express'
import * as ctrl from '../controllers/personController.js'

const router = express.Router()

router.get('/', ctrl.getAll)
router.post('/', ctrl.create)
router.patch('/:id', ctrl.update)
router.delete('/:id', ctrl.softDelete)

export default router
