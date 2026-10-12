const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors()); // lets the ISA-III React app (e.g. localhost:3000/5173) call this API
app.use(express.json());

app.get('/', (req, res) => res.json({ message: 'Recipe Hub API is running', docs: '/README.md' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
