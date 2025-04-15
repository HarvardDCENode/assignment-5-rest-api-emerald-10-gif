const multer = require('multer');
const Photo = require('../models/photoModel');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/img');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const imageFilter = function(req, file, cb) {
  if (file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
    cb(null, true);
  }  else {
    cb(new Error("OnlyImageFilesAllowed"), false);
 }
}

//Data Service Class
class PhotoService {

  //list
  static list(){
    return Photo.find({}) //uses the photo model to return the promise that Photo.find returns
      .then((photos)=>{
        // found
        return photos;
      });
  }

  //find 
  static read(id){
    return Photo.findById(id)
      .then((photo)=>{
        // found
        return photo;
      });
  }

  //create
  static create(obj){
    const photo = new Photo(obj);
    return photo.save();
  }

  //update *error
  static update(id, data){
    return Photo.findById(id)
      .then((photo) => {
        if (!photo) throw new Error("Photo not found");
        console.log("data to set:", data); // debug line
  
        photo.set(data);  // only works if data is a plain object
        return photo.save();
      });
  }

  //delete
  static delete(id){
    return Photo.deleteOne({_id: id})
      .then((obj)=>{
        //removed
        return obj;
      })
  }
}

module.exports.storage = storage;
module.exports.imageFilter = imageFilter;
module.exports.PhotoService = PhotoService;