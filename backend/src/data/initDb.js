const fs = require('fs');
const path = require('path');
const pool = require('./db');

const initDatabase = async () => {
  try {
    // 1. Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS media_items (
        id BIGINT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        grade VARCHAR(50),
        "gradeLabel" VARCHAR(50),
        subject VARCHAR(100),
        type VARCHAR(50),
        duration VARCHAR(100),
        views INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        featured BOOLEAN DEFAULT false,
        popular BOOLEAN DEFAULT false,
        new BOOLEAN DEFAULT false,
        palette VARCHAR(50),
        tags TEXT,
        cover TEXT,
        thumbnail TEXT,
        "fileUrl" TEXT,
        "isPublished" BOOLEAN DEFAULT true,
        "quizQuestions" JSONB DEFAULT '[]'::jsonb
      );
    `;
    await pool.query(createTableQuery);
    console.log('Database table "media_items" is ready.');

    // 2. Check if table is empty
    const { rows } = await pool.query('SELECT COUNT(*) FROM media_items');
    if (parseInt(rows[0].count, 10) === 0) {
      console.log('Table is empty. Starting seed from media.json...');
      
      // 3. Read data from media.json
      const dbPath = path.join(__dirname, 'media.json');
      if (fs.existsSync(dbPath)) {
        const rawData = fs.readFileSync(dbPath, 'utf8');
        const mediaItems = JSON.parse(rawData);

        // 4. Insert data into PostgreSQL
        for (const item of mediaItems) {
          const insertQuery = `
            INSERT INTO media_items (
              id, title, description, grade, "gradeLabel", subject, type, duration,
              views, downloads, featured, popular, new, palette, tags, cover,
              thumbnail, "fileUrl", "isPublished", "quizQuestions"
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
            )
          `;
          
          const values = [
            item.id,
            item.title,
            item.description,
            item.grade,
            item.gradeLabel,
            item.subject,
            item.type,
            item.duration,
            item.views || 0,
            item.downloads || 0,
            item.featured || false,
            item.popular || false,
            item.new || false,
            item.palette,
            item.tags,
            item.cover,
            item.thumbnail,
            item.fileUrl,
            item.isPublished ?? true,
            JSON.stringify(item.quizQuestions || [])
          ];

          await pool.query(insertQuery, values);
        }
        console.log(`Successfully seeded ${mediaItems.length} items from media.json!`);
      } else {
        console.log('media.json not found, skipping seed.');
      }
    } else {
      console.log('Database already has data. Skipping seed.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = initDatabase;
