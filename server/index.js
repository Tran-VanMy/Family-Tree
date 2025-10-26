import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import personsRouter from './routes/persons.js'
import marriagesRouter from './routes/marriages.js'
import parentChildRouter from './routes/parentChild.js'
import authRouter from './routes/auth.js'
import familiesRouter from './routes/trees.js' // rename file name to trees.js or families.js

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => res.send("🚀 Family Tree API is running"))

app.use('/api/auth', authRouter)
app.use('/api/families', familiesRouter)
app.use('/api/persons', personsRouter)
app.use('/api/marriages', marriagesRouter)
app.use('/api/parent-child', parentChildRouter)

const PORT = process.env.PORT || 4000
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`))
