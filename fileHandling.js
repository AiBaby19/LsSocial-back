const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { BadRequest } = require('./utils/error');
require('dotenv').config();

const s3 = new aws.S3({
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretAccessKey,
  Bucket: process.env.AWSBucket,
});

const upload = multer({
  limits: {
    fields: 5,
    fieldNameSize: 50,
    fieldSize: 20000,
    fileSize: 15000000,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == 'image/png' ||
      file.mimetype == 'image/jpg' ||
      file.mimetype == 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new BadRequest('Only .png, .jpg and .jpeg format allowed!'));
    }
  },
  storage: multerS3({
    s3: s3,
    bucket: 'lssocial',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

module.exports = upload;
