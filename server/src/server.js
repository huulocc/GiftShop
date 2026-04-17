const path = require('path')
const dotenv = require('dotenv')

if (envPath) {
  dotenv.config({ path: envPath })
} else {
  dotenv.config()
}

const app = require('./app')

const app = require('./app')

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})