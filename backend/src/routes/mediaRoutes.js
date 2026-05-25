const express = require('express');
const {
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  togglePublish
} = require('../controllers/mediaController');

const router = express.Router();

router.get('/', getMedia);
router.post('/', createMedia);
router.put('/:id', updateMedia);
router.delete('/:id', deleteMedia);
router.patch('/:id/publish', togglePublish);

module.exports = router;
