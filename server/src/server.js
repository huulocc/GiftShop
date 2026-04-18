const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')

const envPaths = [
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '.env'),
]

envPaths.forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true })
  }
})

const app = require('./app')

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})