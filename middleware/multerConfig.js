const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {    //req,file cb call back yei lekhne ho parameter
        //destination vitra garne kinaki yahi file save hunxa kun kasto file save grne vanera
    //logic to validate filetype jpt ecxtension ko file nadine(mimeType/filetype)
    const allowedFileTypes=['image/png','image/jpg','image/jpeg']
    if(!allowedFileTypes.includes(file.mimetype)){   //file.mimetype ma file ko type aauxayaah
      //cb(eauta argument)i.e error
      cb(new Error("invalid file type")) //new error initialize //res.send hudaina middleware ma so yasari error dekhauxa parxa usin callback
      return; // xaina vane yahi bata return vay

      }
      //yo chai else jastai vayo
    console.log(file.mimeType)
    //cb(a,b)i.e 2 arguments i.e success
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