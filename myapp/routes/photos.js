// import modules and setup
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

var multer = require('multer');
var flash = require('express-flash');

var photoController = require('../controllers/photoController');
var Photo = require('../models/photoModel');
const PhotoService = photoController.PhotoService;

// configure Multer with storage and image filter
var upload = multer({
    storage: photoController.storage,
    fileFilter: photoController.imageFilter
  });

// flash messaging middleware
router.use(flash());

//GET all photos
router.get('/', (req, res, next)=>{
  PhotoService.list({})
    .then((photos)=>{
      res.render('photos', {
        photos : photos,
        flashMsg: req.flash("fileUploadError")
      });
    })
    .catch((err)=>{
      if (err) {
        res.end("ERROR!");
      }
    });
    console.log("accessed via Photoservice.list")
});

//GET single photo
router.get('/:photoid', (req, res, next) => {
  console.log("Finding photo with ID: " + req.params.photoid);

  PhotoService.read({ '_id': req.params.photoid })
    .then((photo) => {
      if (!photo) {
        return res.status(404).send("Photo not found");
      }
      res.render('updatePhoto', {
        photo: photo,
        flashMsg: req.flash("photoFindError")
      });
    })
    .catch((err) => {
      if (err) console.log(err);
    });
});

//POST photo
router.post('/', upload.single('image'), (req, res, next)=>{
  var path = "/img/" + req.file.filename;
  var photoData  = {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    imageurl: path,
    title: req.body.title,
    filename: req.file.filename,
    description: req.body.description,
    size: req.file.size / 1024 | 0
  }

  PhotoService.create(photoData)
   .then(()=>{
     console.log("Photo uploaded successfully!");
     res.redirect('/photos');
   })
   .catch((err)=>{
     if (err){
      console.log(err);
      throw new Error("PhotoSaveError", err); //error handling
    }
   });
});

//UPDATE photos
router.post('/:photoid', (req, res, next)=>{
  PhotoService.read({'_id': req.params.photoid})
    .then((photo)=>{
      var data  = {
         title: req.body.title,
         description: req.body.description
         }
      photo.set(data);
      photo.save().then(()=>{
        res.redirect('/photos');
        console.log("Photo updated successfully!")
      });
    })
    .catch((err)=>{
      if (err) console.log(err);
  });
});

//DELETE photos
router.delete('/:photoid', async (req, res) => {
  try {
    const deletedPhoto = await PhotoService.delete(req.params.photoid);
    console.log("Photo deleted successfully")
    if (!deletedPhoto) {
      console.log("No photo found to delete");
      return res.status(404).send("Photo not found");
    }

    res.redirect('/photos');
  } catch (err) {
    console.error("Error deleting photo:", err);
    res.status(500).send("Server error");
  }
});

// handle errors
router.use(function(err, req, res, next){
  console.error(err.stack);
  if (err.message == "OnlyImageFilesAllowed"){
      req.flash('fileUploadError', "Please select an image file with a jpg, png, or gif filename extension.");
      res.redirect('/photos');
  } else if (err.message == "PhotoSaveError"){
    req.flash('photoSaveError', "There was a problem saving your photo.");
    res.redirect('/photos');
  } else{
     next(err);
  }
});

module.exports = router;