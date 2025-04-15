// import modules
const express = require('express');
const router = express.Router();
const multer = require('multer');
const photoController = require('../../controllers/photoController');

const upload = multer({
  storage: photoController.storage,
  fileFilter: photoController.imageFilter
});

const PhotoService = photoController.PhotoService;

// Middleware: Set CORS and JSON headers
router.use((req, res, next) => {
  res.set({
    'Access-Control-Allow-Origin': '*', //any client has access, e.g. allows preflighted requests (checks if "PUT" requests are allowed on this server)
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS', //the API is going to accept these methods
    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Allow-Headers', //the API is going to accept these headers
    'Content-Type': 'application/json'
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); //closes the request
  }

  next();
});


// GET / - List all photos
router.get('/', (req, res, next)=>{
  PhotoService.list()
   .then((photos) => {
     console.log(`API: List images: ${photos}`);
     res.status(200);
     res.json(photos);
   });
 console.log("all photos placeholder")
});


// GET /:photoid - Read single photo
router.get('/:photoid', async (req, res) => {
  try {
    const photo = await PhotoService.read(req.params.photoid);
    console.log(`Found image: ${photo._id}`);
    res.status(200).json(photo);
  } catch (err) {
    console.error("Photo not found:", err);
    res.status(404).end();
  }
});


// POST / - Upload and create new photo
router.post('/', upload.single('image'), async (req, res) => {
  const path = "/static/img/" + (req.file ? req.file.filename : '');
  
  const photo = {
    originalname: req.file?.originalname || 'N/A',
    mimetype: req.file?.mimetype || "N/A",
    imageurl: path,
    title: req.body.title,
    filename: req.file?.filename || 'N/A',
    size: req.file ? (req.file.size / 1024 | 0) : 'N/A',
    description: req.body.description
  };

  try {
    const savedPhoto = await PhotoService.create(photo);
    res.status(201).json(savedPhoto);
  } catch (err) {
    console.error("Error saving photo:", err);
    res.status(500).end();
  }
});


// PUT /:photoid - Update photo
router.put('/:photoid', express.json(), async (req, res) => {
  try {
    const updatedPhoto = await PhotoService.update(req.params.photoid, req.body);
    console.log("Received update body:", req.body);
    res.status(200).json(updatedPhoto);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(404).end();
  }
});


// DELETE /:photoid - Delete photo
router.delete('/:photoid', async (req, res) => {
  const id = req.params.photoid;
  try {
    const deletedPhoto = await PhotoService.delete(id);
    console.log(`Deleted image: ${id}`);
    res.status(200).json(deletedPhoto);
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(404).end();
  }
});


// Error Handler
router.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).end();
});

module.exports = router;
