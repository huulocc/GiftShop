const multer = require('multer')
const multerS3 = require('multer-s3')
const { S3Client } = require('@aws-sdk/client-s3')
const path = require('path')

// Initialize S3 Client using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Configure Multer with Multer-S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read', // Grant public read access to uploaded objects
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set correct mimetype
    key: function (req, file, cb) {
      // Generate unique name: prefix + timestamp + random + extension
      const ext = path.extname(file.originalname)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const filename = `uploads/products/${uniqueSuffix}${ext}`
      cb(null, filename)
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    const filetypes = /jpeg|jpg|png|webp|avif|gif/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Error: Images Only! (jpeg, jpg, png, webp, avif, gif)'))
  },
})

module.exports = upload
