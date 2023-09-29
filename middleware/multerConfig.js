const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {    //req,file cb call back yei lekhne ho parameter
    cb(null, "./uploads/");   //yaha uploads ma store garne folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);  //yeslechai filename k rakhne tsma aagadi time jodera for not duplixcation
  }
});

module.exports = {
  multer,
  storage
};
//yo chai uta roure //app.js ma import garnu parxa use garnalai