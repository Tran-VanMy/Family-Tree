const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/personController');

router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.softDelete);

module.exports = router;
