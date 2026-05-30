const express = require('express');
const {
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  togglePublish
} = require('../controllers/mediaController');
const { requireAdminAuth } = require('../middlewares/requireAdminAuth');

const router = express.Router();

router.get('/', getMedia);
router.post('/', requireAdminAuth, createMedia);
router.put('/:id', requireAdminAuth, updateMedia);
router.delete('/:id', requireAdminAuth, deleteMedia);
router.patch('/:id/publish', requireAdminAuth, togglePublish);

module.exports = router;
