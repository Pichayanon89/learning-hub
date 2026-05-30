const fs = require('fs');
const path = require('path');
const pool = require('../data/db');

function readFallbackMedia() {
  const mediaPath = path.join(__dirname, '../data/media.json');
  const rawMedia = fs.readFileSync(mediaPath, 'utf8');
  return JSON.parse(rawMedia);
}

const getMedia = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM media_items ORDER BY id DESC');
    res.status(200).json(rows);
  } catch (error) {
    try {
      console.warn('[Media API] Database unavailable, serving bundled media fallback:', error.message);
      res.status(200).json(readFallbackMedia());
    } catch (fallbackError) {
      next(fallbackError);
    }
  }
};

const createMedia = async (req, res, next) => {
  try {
    const item = req.body;
    const id = Date.now();
    const views = item.views ?? 0;
    const downloads = item.downloads ?? 0;
    const isPublished = item.isPublished ?? true;
    const featured = item.featured ?? false;
    const popular = item.popular ?? false;
    const newItem = item.new ?? false;

    const insertQuery = `
      INSERT INTO media_items (
        id, title, description, grade, "gradeLabel", subject, type, duration,
        views, downloads, featured, popular, new, palette, tags, cover,
        thumbnail, "fileUrl", "isPublished", "quizQuestions"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
      ) RETURNING *
    `;
    const values = [
      id, item.title, item.description, item.grade, item.gradeLabel, item.subject,
      item.type, item.duration, views, downloads, featured, popular, newItem,
      item.palette, item.tags, item.cover, item.thumbnail, item.fileUrl,
      isPublished, JSON.stringify(item.quizQuestions || [])
    ];

    const { rows } = await pool.query(insertQuery, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateMedia = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = req.body;
    
    const updateQuery = `
      UPDATE media_items SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        grade = COALESCE($3, grade),
        "gradeLabel" = COALESCE($4, "gradeLabel"),
        subject = COALESCE($5, subject),
        type = COALESCE($6, type),
        duration = COALESCE($7, duration),
        palette = COALESCE($8, palette),
        tags = COALESCE($9, tags),
        cover = COALESCE($10, cover),
        thumbnail = COALESCE($11, thumbnail),
        "fileUrl" = COALESCE($12, "fileUrl"),
        "quizQuestions" = COALESCE($13, "quizQuestions")
      WHERE id = $14
      RETURNING *
    `;
    const values = [
      item.title, item.description, item.grade, item.gradeLabel, item.subject,
      item.type, item.duration, item.palette, item.tags, item.cover, item.thumbnail,
      item.fileUrl, item.quizQuestions ? JSON.stringify(item.quizQuestions) : null,
      id
    ];
    
    const { rows } = await pool.query(updateQuery, values);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: `Media item with ID ${id} not found` });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleteQuery = 'DELETE FROM media_items WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(deleteQuery, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: `Media item with ID ${id} not found` });
    }
    
    res.status(200).json({ message: `Media item with ID ${id} successfully deleted` });
  } catch (error) {
    next(error);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const toggleQuery = `
      UPDATE media_items 
      SET "isPublished" = NOT "isPublished" 
      WHERE id = $1 
      RETURNING *
    `;
    const { rows } = await pool.query(toggleQuery, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: `Media item with ID ${id} not found` });
    }
    
    res.status(200).json({ 
      id: rows[0].id,
      isPublished: rows[0].isPublished,
      message: rows[0].isPublished ? 'Media published' : 'Media hidden' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  togglePublish
};
