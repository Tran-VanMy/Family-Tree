// server/index.js
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import personsRouter from './routes/persons.js'
import relationsRouter from './routes/relations.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/persons', personsRouter)
app.use('/api/relations', relationsRouter)

// Start server
const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
