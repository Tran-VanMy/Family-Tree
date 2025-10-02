// server/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const personsRouter = require('./routes/persons');
const relationsRouter = require('./routes/relations');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/persons', personsRouter);
app.use('/api/relations', relationsRouter);

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
