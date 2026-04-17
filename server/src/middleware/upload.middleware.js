const multer = require('multer')
const multerS3 = require('multer-s3')
const { S3Client } = require('@aws-sdk/client-s3')
const fs = require('fs')
const path = require('path')

// Initialize S3 Client using AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const hasS3Config = Boolean(
  process.env.AWS_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
)

const localUploadDir = path.join(__dirname, '..', '..', 'uploads', 'products')

if (!hasS3Config) {
  fs.mkdirSync(localUploadDir, { recursive: true })
  console.warn('AWS S3 config not found. Falling back to local file uploads.')
}

const storage = hasS3Config
  ? multerS3({
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
    })
  : multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, localUploadDir)
      },
      filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, `${uniqueSuffix}${ext}`)
      },
    })

// Configure Multer storage
const upload = multer({
  storage,
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
