const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storageDir = path.join(__dirname, '../assets_uploaded');
if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, storageDir),
  filename: (req, file, cb) => {
    const tag = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${tag}${path.extname(file.originalname || '.jpg')}`);
  },
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image uploads are allowed'), false);
};

const houseImageUpload = multer({
  storage: diskStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
}).array('houseImages', 10);

const avatarUpload = multer({
  storage: diskStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
}).single('avatar');

const removeStoredFile = (filename) => {
  try {
    const filePath = path.join(storageDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) { /* silent */ }
};

module.exports = { houseImageUpload, avatarUpload, removeStoredFile, storageDir };
