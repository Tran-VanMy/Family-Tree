// server/routes/trees.js
import express from 'express'
import * as ctrl from '../controllers/treeController.js'

const router = express.Router()

router.get('/', ctrl.getAll)
router.post('/', ctrl.create)
router.patch('/:id', ctrl.rename) // ✅ mới: đổi tên branch
router.delete('/:id', ctrl.remove)

export default router
