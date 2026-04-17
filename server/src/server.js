const path = require('path')
const dotenv = require('dotenv')
const fs = require('fs')

const envCandidates = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '..', '.env'),
]
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate))

if (envPath) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const app = require('./app')

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})