const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../data/media.json');

const readData = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading media database:', error);
    return [];
  }
};

const writeData = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to media database:', error);
  }
};

const getMedia = (req, res, next) => {
  try {
    const media = readData();
    res.status(200).json(media);
  } catch (error) {
    next(error);
  }
};

const createMedia = (req, res, next) => {
  try {
    const media = readData();
    const newItem = {
      ...req.body,
      id: Date.now(),
      views: req.body.views ?? 0,
      downloads: req.body.downloads ?? 0,
      isPublished: req.body.isPublished ?? true
    };
    
    media.unshift(newItem);
    writeData(media);
    
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

const updateMedia = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const media = readData();
    const index = media.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: `Media item with ID ${id} not found` });
    }
    
    const updatedItem = {
      ...media[index],
      ...req.body,
      id // preserve ID
    };
    
    media[index] = updatedItem;
    writeData(media);
    
    res.status(200).json(updatedItem);
  } catch (error) {
    next(error);
  }
};

const deleteMedia = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const media = readData();
    const filtered = media.filter(item => item.id !== id);
    
    if (media.length === filtered.length) {
      return res.status(404).json({ message: `Media item with ID ${id} not found` });
    }
    
    writeData(filtered);
    res.status(200).json({ message: `Media item with ID ${id} successfully deleted` });
  } catch (error) {
    next(error);
  }
};

const togglePublish = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const media = readData();
    const index = media.findIndex(item => item.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: `Media item with ID ${id} not found` });
    }
    
    const newStatus = !media[index].isPublished;
    media[index].isPublished = newStatus;
    writeData(media);
    
    res.status(200).json({ 
      id,
      isPublished: newStatus,
      message: newStatus ? 'Media published' : 'Media hidden' 
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
