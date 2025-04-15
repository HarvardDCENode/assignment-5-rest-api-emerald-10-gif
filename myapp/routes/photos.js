//users.js
var express = require('express');
var router = express.Router();
var multer = require('multer');
var photoController = require('../controllers/photoController');
var flash = require('express-flash');
var Photo = require('../models/photoModel');
var upload = multer({
  storage: photoController.storage,
  fileFilter: photoController.imageFilter
});

// flash messaging
router.use(flash());

//search database for photos
router.get('/', (req, res, next)=>{
  Photo.find({})
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
});

router.get('/:photoid', (req, res, next)=>{
  console.log("finding "+req.params.photoid);
  Photo.findOne({'_id': req.params.photoid})
    .then((photo)=>{
      res.render('updatePhoto', {
        photo: photo,
        flashMsg: req.flash("photoFindError")
      });
    }).catch((err)=>{
      if (err) console.log(err);
    });
});

//save new photos to database
router.post('/:photoid', (req, res, next)=>{
  Photo.findOne({'_id': req.params.photoid})
    .then((photo)=>{
      var data  = {
         title: req.body.title,
         description: req.body.description
         }
      photo.set(data);
      photo.save().then(()=>{
        res.redirect('/photos');
      });
    })
    .catch((err)=>{
      if (err) console.log(err);
  });
});

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
  var photo = new Photo(photoData);
  photo.save()
   .then(()=>{
     res.redirect('/photos');
   })
   .catch((err)=>{
     if (err){
      console.log(err);
      throw new Error("PhotoSaveError", photo); //error handling
    }
   });
});

//delete photos
router.delete('/:photoid', async (req, res) => {
  try {
    const deletedPhoto = await Photo.findByIdAndDelete(req.params.photoid);
    if (!deletedPhoto) {
      return res.status(404).send("Photo not found");
    }
    res.redirect('/photos');
  } catch (err) {
    res.status(500).send("Error deleting photo");
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